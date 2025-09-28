import React from "react";
import Footer from "../components/Footer/Footer.jsx";
import Header from "../components/Header/Header.jsx";
import FeaturedCreations from "../components/Products/FeaturedCreations.jsx"; 
function Home() {
  return (
    <>
      <Header buttonLabel="LogOut"/>
      <FeaturedCreations/>
      <Footer />
    </>
  );
}

export default Home;
