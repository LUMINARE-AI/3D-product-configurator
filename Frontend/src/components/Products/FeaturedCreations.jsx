import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard.jsx";
import { useNavigate } from "react-router-dom";

const FeaturedCreations = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/products/all");
        const data = await res.json();

        if (Array.isArray(data.message)) {
          setProducts(data.message);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="font-montserrat py-12 bg-[linear-gradient(180deg,#E2F3FF_20.3%,#FFFFFF_80.71%)] w-full">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="flex flex-col md:flex-row justify-between mb-8 md:items-center gap-6 text-center md:text-left">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Featured Creations
            </h2>
            <p>Explore our collection of 3D woolen masterpieces</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full md:w-auto">
            <button
              className="cursor-pointer w-full md:w-auto px-7 py-3 flex items-center justify-center gap-2 rounded-xl font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF]"
              onClick={() => navigate("/create-product")}
            >
              Create Product <i className="fa fa-plus"></i>
            </button>

            <button
              className="cursor-pointer w-full md:w-auto px-7 py-3 flex items-center justify-center gap-2 rounded-xl font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF]"
              onClick={() => navigate("/saved-customizations")} // ✅ Add this
            >
              Saved Designs <i className="fa fa-heart"></i>
            </button>
          </div>
        </div>

        {/* Product list */}
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <ProductCard products={products} setProducts={setProducts} />
        )}
      </div>
    </section>
  );
};

export default FeaturedCreations;
