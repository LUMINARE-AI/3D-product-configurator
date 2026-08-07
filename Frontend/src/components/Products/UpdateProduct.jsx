import { useState, useEffect } from "react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../config.js";
import { apiFetch, unwrapData } from "../../utils/api.js";

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    coverImageURL: null,
    modelFile: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          const product = unwrapData(data) || {};
          setForm({
            name: product.name || "",
            description: product.description || "",
            coverImageURL: null,
            modelFile: null,
          });
        } else {
          toast.error("Failed to fetch product details");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Error loading product");
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;
    
    // File validation
    if (type === "file" && files[0]) {
      const file = files[0];
      
      if (name === "coverImageURL") {
        if (!file.type.startsWith("image/")) {
          toast.error("Please select a valid image file");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
          return;
        }
      }
      
      if (name === "modelFile") {
        if (!file.name.endsWith(".glb")) {
          toast.error("Please select a .glb file");
          return;
        }
        if (file.size > 50 * 1024 * 1024) {
          toast.error("Model file size should be less than 50MB");
          return;
        }
      }
    }
    
    setForm({
      ...form,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!form.name || !form.description) {
    toast.error("Name and description are required");
    return;
  }

  try {
    setLoading(true);
    toast.info("Updating product...");
    
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);

    if (form.coverImageURL) {
      formData.append("coverImageURL", form.coverImageURL);
    }
    if (form.modelFile) {
      formData.append("modelFile", form.modelFile);
    }

    const response = await apiFetch(`/api/v1/products/edit/${id}`, {
      method: "PUT",
      body: formData,
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text);
      toast.error("Server error. Check backend logs.");
      return;
    }

    const result = await response.json();

    if (response.ok) {
      toast.success("Product updated successfully!");
      setTimeout(() => navigate("/gallery"), 1500);
    } else {
      toast.error(result.message || "Failed to update product");
      console.error("Server error:", result);
    }
  } catch (err) {
    console.error("Error:", err);
    toast.error(`Error: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-xl mx-auto font-montserrat p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-center mt-6 mb-6 text-3xl font-semibold text-gray-900">
          Update Product
        </h3>

        <div>
          <label className="block text-md font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-md font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows="4"
            placeholder="Product description"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-md font-medium text-gray-700 mb-2">
            Cover Image (Optional)
          </label>
          <input
            type="file"
            name="coverImageURL"
            accept="image/*"
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
          {form.coverImageURL && (
            <p className="text-sm text-green-600 mt-2">
              Selected: {form.coverImageURL.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-md font-medium text-gray-700 mb-2">
            Model File (Optional)
          </label>
          <input
            type="file"
            name="modelFile"
            accept=".glb"
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">Only .glb format, Max size: 50MB</p>
          {form.modelFile && (
            <p className="text-sm text-green-600 mt-2">
              Selected: {form.modelFile.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full px-7 py-3 flex items-center justify-center gap-2 rounded-xl font-semibold text-white shadow-lg bg-gradient-to-r from-[#0055B1] to-[#52B0FF] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
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
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Updating...
            </span>
          ) : (
            <>
              Update Product <i className="fa fa-edit"></i>
            </>
          )}
        </button>
      </form>
    </div>
  );
}