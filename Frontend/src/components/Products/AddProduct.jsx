// src/components/Products/AddProduct.jsx
import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    coverImageURL: null,
    modelFile: null,
  });
  const [loading, setLoading] = useState(false);

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

    if (
      !form.name ||
      !form.description ||
      !form.coverImageURL ||
      !form.modelFile
    )
      return;

    try {
      setLoading(true);
      const url = `http://localhost:8000/api/v1/products/create`;
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("coverImageURL", form.coverImageURL);
      formData.append("modelFile", form.modelFile);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        navigate("/gallery");
      } else {
        console.log("Failed to create product");
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
    } catch (err) {
      console.log("Error:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto font-montserrat p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-center mt-6 mb-6 text-3xl font-weight: 600 text-gray-900 ">
          Add a new Product
        </h3>
        <div>
          <label
            htmlFor="name"
            className=" block text-md font-medium text-gray-700 mb-2"
          >
            {" "}
            Name{" "}
          </label>
          <input
            type="text"
            required
            name="name"
            placeholder="Product Name (Should be Unique)"
            value={form.name}
            onChange={handleChange}
            className="!imprtant border border-gray-300  p-2 rounded w-full"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-md font-medium text-gray-700 mb-2 form-label"
          >
            {" "}
            Description{" "}
          </label>
          <textarea
            type="text"
            required
            name="description"
            value={form.description}
            onChange={handleChange}
            className="!imprtant border border-gray-300  p-2 rounded w-full"
          />
        </div>

        <div>
          <label
            htmlFor="coverImageURL"
            className="block text-md font-medium text-gray-700 mb-2 form-label"
          >
            {" "}
            Cover Image (png / jpg or any other format){" "}
          </label>
          <input
            type="file"
            required
            name="coverImageURL"
            onChange={handleChange}
            className="!imprtant border border-gray-300 otline-color:gray outline-hidden p-2 rounded w-full"
          />
        </div>

        <div>
          <label
            htmlFor="modelFile"
            className="!imprtant block text-md font-medium text-gray-700 mb-2 form-label"
          >
            {" "}
            ProductFile (.glb){" "}
          </label>
          <input
            type="file"
            required
            name="modelFile"
            onChange={handleChange}
            className=" !imprtant border border-gray-300 otline-color:gray outline-hidden p-2 rounded w-full"
          />
        </div>

         <button
          className="cursor-pointer w-full md:w-auto px-7 py-3 flex items-center justify-center gap-2 rounded-xl font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF]"
          type="submit"
          disabled={loading} // ✅ disable when loading
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
