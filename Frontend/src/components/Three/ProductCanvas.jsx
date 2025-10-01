import { Suspense, useEffect, useState, useRef, memo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { useParams } from "react-router-dom";
import StudioSidebar from "../studio/StudioSidebar";
import Loader from "../Animations/Loader";

function Model({
  url,
  setSelectedPart,
  setHoveredPart,
  onPartsLoaded,
  appliedColors,
}) {
  const { scene } = useGLTF(url);
  const originalColors = useRef({});
  const originalMaterials = useRef({});

  useEffect(() => {
    const colors = {};
    const materials = {};
    const parts = [];

    scene.traverse((child) => {
      if (child.isMesh) {
        child.userData.selectable = true;

        if (!colors[child.material.uuid]) {
          colors[child.material.uuid] = child.material.color.clone();
          materials[child.material.uuid] = child.material;
        }

        if (child.material?.name && !parts.includes(child.material.name)) {
          parts.push(child.material.name);
        }
      }
    });

    originalColors.current = colors;
    originalMaterials.current = materials;

    if (onPartsLoaded) onPartsLoaded(parts);
  }, [scene, onPartsLoaded]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material?.name) {
        const partName = child.material.name;

        if (appliedColors[partName]) {
          if (child.material.map) {
            child.material.map = null;
            child.material.needsUpdate = true;
          }
          child.material.color.set(appliedColors[partName]);
        } else {
          const origColor = originalColors.current[child.material.uuid];
          const origMat = originalMaterials.current[child.material.uuid];
          if (origMat) child.material = origMat.clone();
          if (origColor) child.material.color.copy(origColor);
          child.material.needsUpdate = true;
        }
      }
    });
  }, [appliedColors, scene]);

  return (
    <primitive
      object={scene}
      onClick={(e) => {
        e.stopPropagation();
        const mesh = e.object;
        if (mesh.material?.name) setSelectedPart(mesh.material.name);
      }}
      onPointerMove={(e) => {
        if (e.object.userData.selectable) {
          setHoveredPart({
            name: e.object.material?.name || "",
            x: e.clientX,
            y: e.clientY,
          });
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHoveredPart(null);
        document.body.style.cursor = "auto";
      }}
    />
  );
}

function ProductCanvasBase({
  sidebarOpen,
  currentColor,
  setCurrentColor,
  selectedPart,
  setSelectedPart,
  appliedCustomizations = [], 
  setAppliedCustomizations, 
}) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parts, setParts] = useState([]);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [appliedColors, setAppliedColors] = useState({});

  // NEW: Convert array to object format for the Model component
  useEffect(() => {
    const colorMap = {};
    appliedCustomizations.forEach((custom) => {
      colorMap[custom.partName] = custom.color;
    });
    setAppliedColors(colorMap);
  }, [appliedCustomizations]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/products/${id}`);
        const data = await res.json();
        setProduct(data.message);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 🔥 UPDATED: Sync changes back to parent component
  const handleApply = (part, color) => {
    setAppliedColors((prev) => ({
      ...prev,
      [part]: color,
    }));

    // Update parent's appliedCustomizations array
    if (setAppliedCustomizations) {
      setAppliedCustomizations((prev) => {
        const existing = prev.find((c) => c.partName === part);
        if (existing) {
          return prev.map((c) =>
            c.partName === part ? { ...c, color } : c
          );
        } else {
          return [...prev, { partName: part, color }];
        }
      });
    }
  };

  return (
    <div className="w-full h-screen relative">
      {loading && <Loader />}
      {product && (
        <>
          <Canvas camera={{ position: [0, 0, 1.5], near: 0.025 }}>
            <Suspense fallback={null}>
              <Environment preset="sunset" />
              <Model
                url={product.modelFile}
                setSelectedPart={setSelectedPart}
                appliedColors={appliedColors}
                setHoveredPart={setHoveredPart}
                onPartsLoaded={setParts}
              />
              <OrbitControls
                makeDefault
                enableDamping
                enablePan={false}
                maxPolarAngle={Math.PI / 2}
              />
            </Suspense>
          </Canvas>

          <StudioSidebar
            sidebarOpen={sidebarOpen}
            currentColor={currentColor}
            setCurrentColor={setCurrentColor}
            selectedPart={selectedPart}
            setSelectedPart={setSelectedPart}
            parts={parts}
            setParts={setParts}
            onApply={handleApply}
          />

          {hoveredPart && (
            <div
              className="absolute bg-black/80 text-white px-3 py-1.5 rounded-md text-xs pointer-events-none"
              style={{ left: hoveredPart.x + 10, top: hoveredPart.y + 10 }}
            >
              {hoveredPart.name}
            </div>
          )}

          <div
            className="
  absolute bottom-4 left-1/2 -translate-x-1/2
  text-black text-base font-semibold
  bg-white/20 backdrop-blur-md
  border border-white/30
  px-5 py-2 rounded-3xl
  shadow-[0_8px_25px_rgba(0,0,0,0.3)]
  text-center
  tracking-wide
  transition-all duration-300
  hover:scale-105 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)]
"
          >
            {product.name}
          </div>
        </>
      )}
    </div>
  );
}

export default memo(ProductCanvasBase);