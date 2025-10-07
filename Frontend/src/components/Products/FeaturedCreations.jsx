import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard.jsx";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../hooks/useAdmin.js";
import {API_URL} from "../../config.js";

const FeaturedCreations = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); 
  const [visibleCount, setVisibleCount] = useState(6); // ✅ show 6 initially
  const isAdmin = useAdmin();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/products/all`);
        const data = await res.json();

        if (Array.isArray(data.message)) {
          setProducts(data.message);
          setFilteredProducts(data.message);
        } else {
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ handle search filtering
  useEffect(() => {
    if (!search.trim()) {
      setFilteredProducts(products);
    } else {
      const results = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(results);
    }
    setVisibleCount(6); // reset visible count on search
  }, [search, products]);

  // ✅ Handle Load More
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <section className="font-montserrat py-12 bg-[linear-gradient(180deg,#E2F3FF_20.3%,#FFFFFF_80.71%)] w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between mb-8 md:items-center gap-6 text-center md:text-left">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Featured Creations
            </h2>
            <p>Explore our collection of 3D woolen masterpieces</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full md:w-auto">
            {/* ✅ Search Input */}
            <div className="relative w-full md:w-64">
              <i className="fa fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/80"></i>
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 md:py-3 rounded-full bg-gradient-to-r from-[#0055B1] to-[#52B0FF] 
                          text-white placeholder-white/70 shadow 
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0055B1] 
                          w-full transition-all duration-200"
              />
            </div>

            {/* ✅ Only show for admin */}
            {isAdmin && (
              <button
                className="cursor-pointer w-full md:w-auto px-7 py-3 flex items-center justify-center gap-2 rounded-xl font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF]"
                onClick={() => navigate("/create-product")}
              >
                Add Product <i className="fa fa-plus"></i>
              </button>
            )}

            <button
              className="cursor-pointer w-full md:w-auto px-7 py-3 flex items-center justify-center gap-2 rounded-xl font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF]"
              onClick={() => navigate("/saved-customizations")}
            >
              Customized Products <i className="fa fa-heart"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : filteredProducts.length > 0 ? (
          <>
            <ProductCard
              products={filteredProducts.slice(0, visibleCount)} // ✅ show limited products
              setProducts={setProducts}
              isAdmin={isAdmin}
            />

            {/* ✅ Load More Button */}
            {visibleCount < filteredProducts.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="px-7 py-3 flex items-center gap-2 rounded-full font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF] hover:scale-105 transition-all"
                >
                  Load More <i className="fa fa-plus"></i>
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500">No products found</p>
        )}
      </div>
    </section>
  );
};

export default FeaturedCreations;
