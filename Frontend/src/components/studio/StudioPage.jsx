import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {toast ,  ToastContainer } from "react-toastify";
import StudioHeader from "./StudioHeader";
import ProductCanvas from "../Three/ProductCanvas";
import SaveCustomizationModal from "../SavedCustomizationsPage.jsx/SaveCustomizationModal";

export default function StudioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentColor, setCurrentColor] = useState("#ec4899");
  const [selectedPart, setSelectedPart] = useState(null);
  const [appliedCustomizations, setAppliedCustomizations] = useState([]);

  const [showModal, setShowModal] = useState(false);

  // Load pre-existing customizations if coming from "Customize Again"
  useEffect(() => {
    if (location.state?.loadCustomization) {
      const customizations = location.state.loadCustomization;
      setAppliedCustomizations(customizations);
      
      // Apply first customization as current selection
      if (customizations.length > 0) {
        setSelectedPart(customizations[0].partName);
        setCurrentColor(customizations[0].color);
      }
    }
  }, [location.state]);

  // Handle color changes
  const handleColorChange = (newColor) => {
    setCurrentColor(newColor);
    
    if (selectedPart) {
      // Update or add customization for current part
      setAppliedCustomizations(prev => {
        const existing = prev.find(c => c.partName === selectedPart);
        if (existing) {
          return prev.map(c => 
            c.partName === selectedPart 
              ? { ...c, color: newColor }
              : c
          );
        } else {
          return [...prev, { partName: selectedPart, color: newColor }];
        }
      });
    }
  };

  const handleSaveCustomization = async ({ name, description }) => {
  try {
    const customizationsToSave =
      appliedCustomizations.length > 0
        ? appliedCustomizations
        : selectedPart
        ? [{ partName: selectedPart, color: currentColor }]
        : [];

    if (customizationsToSave.length === 0) {
      toast.error("⚠️ Please customize at least one part before saving");
      return;
    }

    await fetch("http://localhost:8000/api/v1/customizations/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseProductId: id,
        name,
        description,
        customizations: customizationsToSave,
      }),
    });

    toast.success("✅ Customization saved successfully!");
    setShowModal(false);
    navigate("/saved-customizations");
  } catch (err) {
    console.error("Save failed:", err);
    toast.error("❌ Failed to save customization");
  }
};


  if (!id) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center font-montserrat bg-gradient-to-b from-blue-100 to-white">
        <h2 className="text-2xl font-bold text-zinc-800 mb-4">
          Please select a product from the gallery to start customizing.
        </h2>
        <button
          onClick={() => navigate("/gallery")}
          className="cursor-pointer px-6 py-3 bg-gradient-to-r from-[#0055B1] to-[#52B0FF] text-white font-semibold rounded-lg shadow-md hover:scale-105 transition"
        >
          Go to Gallery
        </button>
      </div>
    );
  }

  return (
    <div className="font-montserrat bg-gradient-to-b from-blue-100 to-white text-zinc-900 h-screen overflow-hidden">
      <StudioHeader />

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`cursor-pointer fixed top-[20vh] z-[110] h-12 rounded-full bg-gradient-to-r from-[#0055B1] to-[#52B0FF] text-white flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out ${
          sidebarOpen ? "right-[19rem] w-12" : "right-5 w-auto px-5 py-3 gap-2"
        }`}
      >
        {sidebarOpen ? (
          <i className="fas fa-times text-lg"></i>
        ) : (
          <span className="flex items-center gap-2 font-semibold whitespace-nowrap">
            Customize Now
          </span>
        )}
      </button>

      <main className="h-screen w-screen relative pt-[88px] flex flex-col items-center">
        <ProductCanvas
          sidebarOpen={sidebarOpen}
          currentColor={currentColor}
          setCurrentColor={handleColorChange}
          selectedPart={selectedPart}
          setSelectedPart={setSelectedPart}
          appliedCustomizations={appliedCustomizations}
        />



        <div className="flex gap-4 mb-6">
          <button
            className="cursor-pointer px-8 py-4 text-white font-bold uppercase bg-gradient-to-r from-[#0055B1] to-[#52B0FF]"
            onClick={() => {
              toast.success("✅ Customization saved successfully!");
              setShowModal(true);
            }}
          >
            Save
          </button>

          <button
            className="cursor-pointer px-8 py-3 bg-gray-800 text-yellow-500 font-bold uppercase hover:bg-gray-900 transition"
            onClick={() => {
              setAppliedCustomizations([]);
              navigate(0);
            }}
          >
            Reset
          </button>
        </div>
      </main>

      {/* Modal for Name & Description */}
      <SaveCustomizationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCustomization}
      />
    </div>
  );
}