// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import CreateProduct from "./pages/CreateProduct";
import Studio from "./pages/Studio";
import SavedCustom from "./pages/SavedCustom";

export default function App() {
  return (
    <>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="/studio/:id" element={<Studio />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/saved-customizations" element={<SavedCustom />} />
          <Route path="*" element={<h1 className="text-3xl font-bold text-center mt-20">404 - Page Not Found</h1>} />
        </Routes>
      </main>
    </>
  );
}
