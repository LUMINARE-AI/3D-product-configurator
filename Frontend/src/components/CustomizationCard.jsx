import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Palette } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CustomizationCard = ({ customizations, setCustomizations }) => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Ensure customizations is always an array
  const safeCustomizations = Array.isArray(customizations) ? customizations : [];

  if (safeCustomizations.length === 0) {
    return (
      <p className="text-center text-gray-600 text-lg font-medium">
        No saved customizations found!
      </p>
    );
  }

  const handleCustomizeAgain = (customization) => {
    setLoadingId(customization._id);
    setTimeout(() => {
      // Navigate to studio with the base product ID
      // Make sure baseProduct exists before navigating
      if (customization.baseProduct?._id) {
        navigate(`/studio/${customization.baseProduct._id}`, {
          state: { 
            loadCustomization: customization.customizations 
          }
        });
      } else {
        alert("Error: Base product not found");
        setLoadingId(null);
      }
    }, 300);
  };

  // Confirm Toast before delete
  const handleDeleteClick = (id) => {
    toast.info(
      ({ closeToast }) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-800">
            Are you sure you want to delete this customization?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                closeToast();
                deleteCustomization(id);
              }}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={closeToast}
              className="px-3 py-1 bg-gray-300 text-sm rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
      }
    );
  };

  // Delete customization
  const deleteCustomization = async (id) => {
    try {
      setDeletingId(id);

      const res = await fetch(
        `http://3.109.157.61:8000/api/v1/customizations/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete customization");
      }

      toast.success("Customization deleted ✅");

      // Remove from UI
      setCustomizations((prev) => prev.filter((c) => c._id !== id));

    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete customization ❌");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="font-montserrat w-full grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 justify-items-center justify-center gap-y-14 gap-x-14">
        {safeCustomizations.map((customization) => (
          <div
            key={customization._id}
            className="w-full bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl relative"
          >
            <div className="block relative group">
              {/* Image - Using base product's cover image */}
              <div className="relative overflow-hidden rounded-t-xl">
                <img
                  src={customization.baseProduct?.coverImageURL || "/api/placeholder/400/240"}
                  alt={customization.name || "Customization"}
                  className="w-full h-60 object-cover rounded-t-xl"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/400/240";
                  }}
                />

                {/* Customization Badge */}
                <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  Custom
                </div>

                {/* Hover Buttons */}
                <div className="absolute top-0 right-0 h-fit flex flex-col items-end gap-2 translate-x-full group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out">
                  {/* Customize Again Btn */}
                  <button
                    onClick={() => handleCustomizeAgain(customization)}
                    className="cursor-pointer m-2 px-5 py-3 text-white font-semibold flex items-center gap-2 bg-gradient-to-r from-[#0055B1] to-[#52B0FF] rounded-md shadow"
                    disabled={loadingId === customization._id}
                  >
                    {loadingId === customization._id ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                    ) : (
                      <Palette className="w-4 h-4" />
                    )}
                    {loadingId === customization._id ? "Loading..." : "Customize Again"}
                  </button>

                  {/* Delete Btn */}
                  <button
                    onClick={() => handleDeleteClick(customization._id)}
                    className="cursor-pointer m-2 px-5 py-3 text-white font-semibold flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 rounded-md shadow"
                    disabled={deletingId === customization._id}
                  >
                    {deletingId === customization._id ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                    {deletingId === customization._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              {/* Customization Info */}
              <div className="px-4 py-3 w-full">
                <p className="text-lg font-bold text-black truncate block capitalize">
                  {customization.name}
                </p>
                <p className="text-gray-600 mr-3 text-sm mb-2">
                  {customization.description}
                </p>
                <p className="text-xs text-gray-500">
                  Base Product: {customization.baseProduct?.name}
                </p>
                
                {/* Show customization details */}
                {customization.customizations && customization.customizations.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Customizations:</p>
                    <div className="flex flex-wrap gap-1">
                      {customization.customizations.map((custom, index) => (
                        <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                          <div 
                            className="w-3 h-3 rounded-full border" 
                            style={{ backgroundColor: custom.color }}
                          ></div>
                          <span>{custom.partName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
};

export default CustomizationCard;
