// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import CreateProduct from "./pages/CreateProduct";
import Studio from "./pages/Studio";
import SavedCustom from "./pages/SavedCustom";
import UpdateProductPage from "./pages/UpdatePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ThreeDPage from "./pages/ThreeDPage";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  return (
    <>
      <main>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="/studio/:id" element={<Studio />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/saved-customizations" element={<SavedCustom />} />
          <Route path="/edit/:id" element={<UpdateProductPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/3d-page' element={<ThreeDPage />} />
          <Route path='/reset-password/:token' element={<ResetPassword />} />
          <Route path="*" element={<h1 className="text-3xl font-bold text-center mt-20">404 - Page Not Found</h1>} />
        </Routes>
      </main>
    </>
  );
}
