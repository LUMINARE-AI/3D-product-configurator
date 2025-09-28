import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import StudioSidebar from "../studio/StudioSidebar";
import Loader from "../Animations/Loader";

function Model({ url, setSelectedPart, selectedPart, currentColor }) {
  const { scene } = useGLTF(url);
  const originalColors = useRef({}); // ✅ useRef instead of useState

  // Save original colors once
  useEffect(() => {
    const colors = {};
    scene.traverse((child) => {
      if (child.isMesh) {
        child.userData.selectable = true;
        colors[child.material.uuid] = child.material.color.clone();
      }
    });
    originalColors.current = colors;
  }, [scene]);

  // Apply selected color
  useEffect(() => {
    if (selectedPart && currentColor) {
      scene.traverse((child) => {
        if (child.isMesh && child.material?.name === selectedPart) {
          if (child.material.map) {
            child.material.map = null;
            child.material.needsUpdate = true;
          }
          child.material.color.set(currentColor);
        }
      });
    }
  }, [currentColor, selectedPart, scene]);

  

  return (
    <primitive
      object={scene}
      onClick={(e) => {
        e.stopPropagation();
        const mesh = e.object;
        if (mesh.material?.name) setSelectedPart(mesh.material.name);
      }}
      onPointerOver={(e) => {
        if (e.object.userData.selectable) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    />
  );
}

export default function ProductCanvas({
  sidebarOpen,
  currentColor,
  setCurrentColor,
  selectedPart,
  setSelectedPart,
}) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="w-full h-screen relative">
      {loading && <Loader />}
      {product && (
        <>
          <Canvas camera={{ position: [0, 0, 1.5], near: 0.025 }}>
            <Environment preset="sunset" />
            <Model
              url={product.modelFile}
              setSelectedPart={setSelectedPart}
              selectedPart={selectedPart}
              currentColor={currentColor}
            />
            <OrbitControls maxPolarAngle={Math.PI / 2} />
          </Canvas>

          <StudioSidebar
            sidebarOpen={sidebarOpen}
            currentColor={currentColor}
            setCurrentColor={setCurrentColor}
            selectedPart={selectedPart}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg bg-black/50 px-4 py-2 rounded">
            {product.name}
          </div>
        </>
      )}
    </div>
  );
}
