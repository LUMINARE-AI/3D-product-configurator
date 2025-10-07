import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react"; // Delete icon
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {API_URL} from "../../config.js";

const ProductCard = ({ products, setProducts, isAdmin }) => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  if (!products || products.length === 0) {
    return (
      <p className="text-center text-gray-600 text-lg font-medium">
        No products found!
      </p>
    );
  }

  const handleCustomizeClick = (id) => {
    setLoadingId(id);
    setTimeout(() => {
      navigate(`/studio/${id}`);
    }, 300);
  };

  // Confirm Toast before delete
  const handleDeleteClick = (id) => {
    toast.info(
      ({ closeToast }) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-800">
            Are you sure you want to delete this product?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                closeToast();
                deleteProduct(id);
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

  // Actual delete request
  const deleteProduct = async (id) => {
    try {
      setDeletingId(id);

      const res = await fetch(
        `${API_URL}/api/v1/products/delete/${id}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted ✅");

      // ✅ Remove from UI
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error || "Failed to delete ❌");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (id) => {
    navigate(`/edit/${id}`);
  };

   return (
    <>
      <div className="font-montserrat w-full grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 justify-items-center justify-center gap-y-14 gap-x-14">
        {products.map((product) => (
          <div
            key={product._id}
            className="w-full bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl relative"
          >
            <a className="block relative group">
              <div className="relative overflow-hidden rounded-t-xl">
                <img
                  src={product.coverImageURL}
                  alt={product.name}
                  className="w-full h-60 object-cover rounded-t-xl"
                />

                {/* Hover Buttons */}
                <div className="absolute top-0 right-0 h-fit flex flex-col items-end gap-2 translate-x-full group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out">
                  {/* Customize - All users can see */}
                  <button
                    onClick={() => handleCustomizeClick(product._id)}
                    className="cursor-pointer m-2 px-5 py-3 text-white font-semibold flex items-center gap-2 bg-gradient-to-r from-[#0055B1] to-[#52B0FF] rounded-md shadow"
                    disabled={loadingId === product._id}
                  >
                    {loadingId === product._id ? (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    ) : null}
                    {loadingId === product._id ? "Loading..." : "Customize"}
                  </button>

                  {/* ✅ Edit - Only admin can see */}
                  {isAdmin && (
                    <button
                      onClick={() => handleEditClick(product._id)}
                      className="cursor-pointer m-2 px-5 py-3 text-white font-semibold flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-md shadow"
                    >
                      <i className="fa fa-edit"></i> Edit Details
                    </button>
                  )}

                  {/* ✅ Delete - Only admin can see */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteClick(product._id)}
                      className="cursor-pointer m-2 px-5 py-3 text-white font-semibold flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 rounded-md shadow"
                      disabled={deletingId === product._id}
                    >
                      {deletingId === product._id ? (
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                      {deletingId === product._id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>

              <div className="px-4 py-3 w-full">
                <p className="text-lg font-bold text-black truncate block capitalize">
                  {product.name}
                </p>
                <span className="text-gray-600 mr-3 text-sm">
                  {product.description}
                </span>
              </div>
            </a>
          </div>
        ))}
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
};



export default ProductCard;
