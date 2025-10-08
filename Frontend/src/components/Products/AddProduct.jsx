// src/components/Products/AddProduct.jsx
import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    coverImageURL: null,
    modelFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // ✅ Add error state

  const navigate = useNavigate();
  
  const handleChange = async (e) => {
    const { name, type, value, files } = e.target;
    setForm({
      ...form,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // ✅ Reset error

    if (
      !form.name ||
      !form.description ||
      !form.coverImageURL ||
      !form.modelFile
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const url = `${API_URL}/api/v1/products/create`;
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("coverImageURL", form.coverImageURL);
      formData.append("modelFile", form.modelFile);

      console.log("Sending request to:", url); // ✅ Debug log

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include", // ✅ IMPORTANT - Add this
      });

      console.log("Response status:", response.status); // ✅ Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create product: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);

      // Reset form
      setForm({
        name: "",
        description: "",
        coverImageURL: null,
        modelFile: null,
      });

      // Navigate to gallery
      navigate("/gallery");
      
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to create product");
    } finally {
      setLoading(false); // ✅ Always reset loading
    }
  };

  return (
    <div className="max-w-xl mx-auto font-montserrat p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-center mt-6 mb-6 text-3xl font-weight: 600 text-gray-900">
          Add a new Product
        </h3>

        {/* ✅ Show error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-md font-medium text-gray-700 mb-2"
          >
            Name
          </label>
          <input
            type="text"
            required
            name="name"
            placeholder="Product Name (Should be Unique)"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-md font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            required
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
            rows="4"
          />
        </div>

        <div>
          <label
            htmlFor="coverImageURL"
            className="block text-md font-medium text-gray-700 mb-2"
          >
            Cover Image (png / jpg or any other format)
          </label>
          <input
            type="file"
            required
            name="coverImageURL"
            accept="image/*"
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div>
          <label
            htmlFor="modelFile"
            className="block text-md font-medium text-gray-700 mb-2"
          >
            Product File (.glb)
          </label>
          <input
            type="file"
            required
            name="modelFile"
            accept=".glb"
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <button
          className="cursor-pointer w-full md:w-auto px-7 py-3 flex items-center justify-center gap-2 rounded-xl font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF] disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
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
              Adding...
            </span>
          ) : (
            <>
              Add Product <i className="fa fa-plus"></i>
            </>
          )}
        </button>
      </form>
    </div>
  );
}