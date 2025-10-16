import { Suspense, useEffect, useState, useRef, memo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Center } from "@react-three/drei";
import { useParams } from "react-router-dom";
import StudioSidebar from "../studio/StudioSidebar";
import Loader from "../Animations/Loader";
import { API_URL } from "../../config";
import * as THREE from "three";

function Model({
  url,
  setSelectedPart,
  setHoveredPart,
  onPartsLoaded,
  appliedColors,
  highlightedPart,
}) {
  const { scene } = useGLTF(url);
  const originalColors = useRef({});
  const originalMaterials = useRef({});
  const modelRef = useRef();

  // Auto-scale model to fit viewport perfectly
  // Auto-scale model to a consistent size for all products
useEffect(() => {
  if (scene) {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Get largest dimension (width, height, or depth)
    const maxDim = Math.max(size.x, size.y, size.z);

    // 🔹 Set a consistent target size for all models
    const targetSize = 1.2; // Adjust this value to make all models appear same size

    // Calculate scale factor
    const scale = targetSize / maxDim;

    // Apply scaling
    scene.scale.setScalar(scale);

    // Center the model
    const center = new THREE.Vector3();
    box.getCenter(center);
    scene.position.sub(center.multiplyScalar(scale));

    // Slight lift above ground
    scene.position.y += size.y * scale * 0.05;
  }
}, [scene]);


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
          child.material.emissive.setHex(0x000000);
          child.material.emissiveIntensity = 0;
          child.material.needsUpdate = true;
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

  useEffect(() => {
    let animationId;
    let startTime = Date.now();

    const animateHighlight = () => {
      if (highlightedPart) {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % 1000) / 1000;
        const intensity = 0.3 + Math.sin(progress * Math.PI * 2) * 0.3;

        scene.traverse((child) => {
          if (child.isMesh && child.material?.name) {
            const partName = child.material.name;

            if (partName === highlightedPart) {
              child.material.emissive.setHex(0x0066ff);
              child.material.emissiveIntensity = intensity;
              child.material.needsUpdate = true;
            }
          }
        });

        animationId = requestAnimationFrame(animateHighlight);
      } else {
        scene.traverse((child) => {
          if (child.isMesh) {
            child.material.emissive.setHex(0x000000);
            child.material.emissiveIntensity = 0;
            child.material.needsUpdate = true;
          }
        });
      }
    };

    animateHighlight();

    return () => cancelAnimationFrame(animationId);
  }, [highlightedPart, scene]);

  return (
    <primitive
      ref={modelRef}
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

function Lights() {
  return (
    <>
      {/* Bright ambient light for clean look */}
      <ambientLight intensity={1.2} />
      
      {/* Key light from front-right */}
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      {/* Fill light from left */}
      <directionalLight position={[-5, 3, 3]} intensity={0.5} />
      
      {/* Back light to eliminate shadows */}
      <directionalLight position={[0, 5, -5]} intensity={0.5} />
    </>
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
  const [highlightedPart, setHighlightedPart] = useState(null);

  useEffect(() => {
    if (selectedPart) {
      setHighlightedPart(selectedPart);
      const timeout = setTimeout(() => {
        setHighlightedPart(null);
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [selectedPart]);

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
        const res = await fetch(`${API_URL}/api/v1/products/${id}`);
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

  const handleApply = (part, color) => {
    setAppliedColors((prev) => ({
      ...prev,
      [part]: color,
    }));

    if (setAppliedCustomizations) {
      setAppliedCustomizations((prev) => {
        const existing = prev.find((c) => c.partName === part);
        if (existing) {
          return prev.map((c) => (c.partName === part ? { ...c, color } : c));
        } else {
          return [...prev, { partName: part, color }];
        }
      });
    }
  };

  return (
    <div className="w-full h-screen relative bg-white">
      {loading && <Loader />}
      {product && (
        <>
          <Canvas 
            camera={{ position: [0, 0, 2.8], fov: 40, near: 0.1, far: 1000 }}
            gl={{ 
              antialias: true,
              preserveDrawingBuffer: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2,
              outputColorSpace: THREE.SRGBColorSpace
            }}
            style={{ background: '#ffffff' }}
          >
            <Suspense fallback={null}>
              {/* Model viewer style lighting */}
              <Lights />
              
              {/* Neutral environment for clean white background */}
              <Environment preset="city" intensity={0.3} />
              
              {/* Model with automatic size normalization */}
              <Model
                url={product.modelFile}
                setSelectedPart={setSelectedPart}
                appliedColors={appliedColors}
                setHoveredPart={setHoveredPart}
                onPartsLoaded={setParts}
                highlightedPart={highlightedPart}
              />
              
              <OrbitControls 
                makeDefault 
                enableDamping 
                dampingFactor={0.05}
                enablePan={false}
                minDistance={1.5}
                maxDistance={6}
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

          {/* Hover Tooltip */}
          {hoveredPart && (
            <div
              className="absolute bg-black/90 text-white px-4 py-2 rounded-lg text-sm pointer-events-none
              shadow-lg border border-blue-500/50 backdrop-blur-sm animate-fadeIn"
              style={{ left: hoveredPart.x + 10, top: hoveredPart.y + 10 }}
            >
              <span className="font-semibold">{hoveredPart.name}</span>
              <div className="text-xs text-blue-300 mt-1">Click to select</div>
            </div>
          )}

          <div
            className="
  absolute bottom-4 left-1/2 -translate-x-1/2
  text-black text-base font-semibold
  bg-white/20 backdrop-blur-md
  border border-white/30
  px-5 py-2 rounded-xl
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