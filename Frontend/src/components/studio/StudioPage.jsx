import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import StudioHeader from "./StudioHeader";
import ProductCanvas from "../Three/ProductCanvas";
import SaveCustomizationModal from "../SavedCustomizationsPage.jsx/SaveCustomizationModal";
import { useAuth } from "../../hooks/useAuth";
import { API_URL } from "../../config";

export default function StudioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isLoggedIn = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState("#ec4899");
  const [selectedPart, setSelectedPart] = useState(null);
  const [appliedCustomizations, setAppliedCustomizations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [savedCustomizationId, setSavedCustomizationId] = useState(null);

  // Fetch all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/products/all`);
        const data = await res.json();
        if (Array.isArray(data.message)) {
          setAllProducts(data.message);
          const current = data.message.find((p) => p._id === id);
          setCurrentProduct(current);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (id) {
      fetchAllProducts();
    }
  }, [id]);

  // 🔥 NEW: Load the last saved customization for this product
  useEffect(() => {
    const loadLastCustomization = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/customizations/all`);
        const data = await res.json();
        
        if (data.success && Array.isArray(data.message)) {
          // Find the most recent customization for this product
          const productCustomizations = data.message
            .filter((c) => c.baseProduct._id === id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          if (productCustomizations.length > 0) {
            const latestCustomization = productCustomizations[0];
            setAppliedCustomizations(latestCustomization.customizations);
            setSavedCustomizationId(latestCustomization._id);
            
            if (latestCustomization.customizations.length > 0) {
              setSelectedPart(latestCustomization.customizations[0].partName);
              setCurrentColor(latestCustomization.customizations[0].color);
            }
            
            toast.info("✨ Loaded your last saved customization");
          }
        }
      } catch (error) {
        console.error("Error loading customization:", error);
      }
    };

    // Only load if not coming from "Customize Again" state
    if (id && !location.state?.loadCustomization) {
      loadLastCustomization();
    }
  }, [id, location.state]);

  // Handle product change
  const handleProductChange = (productId) => {
    setDropdownOpen(false);
    if (productId !== id) {
      setAppliedCustomizations([]);
      setSelectedPart(null);
      setCurrentColor("#ec4899");
      setSavedCustomizationId(null);
      window.location.href = `/studio/${productId}`
    }
  }; 

  // Load pre-existing customizations (from "Customize Again")
  useEffect(() => {
    if (location.state?.loadCustomization) {
      const customizations = location.state.loadCustomization;
      setAppliedCustomizations(customizations);
      setSavedCustomizationId(location.state?.customizationId || null);

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
      setAppliedCustomizations((prev) => {
        const existing = prev.find((c) => c.partName === selectedPart);
        if (existing) {
          return prev.map((c) =>
            c.partName === selectedPart ? { ...c, color: newColor } : c
          );
        } else {
          return [...prev, { partName: selectedPart, color: newColor }];
        }
      });
    }
  };

  // Save customization
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

      const res = await fetch(`${API_URL}/api/v1/customizations/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseProductId: id,
          name,
          description,
          customizations: customizationsToSave,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSavedCustomizationId(data.message._id);
        toast.success("✅ Customization saved successfully!");
        setShowModal(false);
        // Don't navigate away, keep the customization visible
        // navigate("/saved-customizations");
      } else {
        toast.error(data.message || "❌ Failed to save customization");
      }
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("❌ Error while saving customization");
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
    <div className="font-montserrat bg-white text-zinc-900 h-screen overflow-hidden">
      <StudioHeader buttonLabel={isLoggedIn ? "LogOut" : "Login"} />

      <div className="fixed top-24 left-6 z-[100]">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="cursor-pointer flex items-center gap-4 px-6 py-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-xl shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50 transition-all duration-300 min-w-[320px] backdrop-blur-sm"
          >
            <div className="flex-1 text-left">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                Current Product
              </p>
              <p className="text-base font-bold text-white truncate">
                {currentProduct?.name || "Select Product"}
              </p>
            </div>
            <i
              className={`fas fa-chevron-down text-blue-400 transition-transform duration-300 text-lg ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            ></i>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-3 w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-xl shadow-2xl max-h-[480px] overflow-y-auto z-[101] backdrop-blur-md">
              <div className="p-3">
                <p className="px-4 cursor-pointer py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-slate-700/50">
                  All Products ({allProducts.length})
                </p>
                <div className="mt-2 space-y-2">
                  {allProducts.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleProductChange(product._id)}
                      className={`w-full cursor-pointer text-left px-4 py-4 rounded-lg transition-all duration-200 flex items-center gap-4 ${
                        product._id === id
                          ? "bg-gradient-to-r from-[#0055B1] to-[#52B0FF] text-white shadow-lg scale-[1.02]"
                          : "hover:bg-slate-800/70 text-gray-300 hover:scale-[1.01]"
                      }`}
                    >
                      <img
                        src={product.coverImageURL}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover border-2 border-white/20 shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-base truncate mb-1 ${
                            product._id === id ? "text-white" : "text-white"
                          }`}
                        >
                          {product.name}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            product._id === id
                              ? "text-white/80"
                              : "text-gray-400"
                          }`}
                        >
                          {product.description}
                        </p>
                      </div>
                      {product._id === id && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">Active</span>
                          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: rgba(15, 23, 42, 0.5);
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb {
                  background: linear-gradient(to bottom, #0055b1, #52b0ff);
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: linear-gradient(to bottom, #0066cc, #63c0ff);
                }
              `}</style>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`cursor-pointer fixed top-[20vh] z-[110] h-12 rounded-xl bg-gradient-to-r from-[#0055B1] to-[#52B0FF] text-white flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out ${
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

      {/* Main Canvas Area */}
      <main className="h-screen w-screen relative pt-[88px] flex flex-col items-center">
        <ProductCanvas
          sidebarOpen={sidebarOpen}
          currentColor={currentColor}
          setCurrentColor={handleColorChange}
          selectedPart={selectedPart}
          setSelectedPart={setSelectedPart}
          appliedCustomizations={appliedCustomizations}
          setAppliedCustomizations={setAppliedCustomizations}
        />

        <div className="flex gap-4 mb-4">
          <button
            className="cursor-pointer rounded-xl px-8 py-3 text-white font-bold uppercase bg-gradient-to-r from-[#0055B1] to-[#52B0FF]"
            onClick={() => setShowModal(true)}
          >
            {savedCustomizationId ? "Update" : "Save"}
          </button>

          <button
            className="cursor-pointer rounded-xl px-8 py-3 bg-gray-800 text-yellow-500 font-bold uppercase hover:bg-gray-900 transition"
            onClick={() => {
              setAppliedCustomizations([]);
              setSelectedPart(null);
              setCurrentColor("#ec4899");
              setSavedCustomizationId(null);
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

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}