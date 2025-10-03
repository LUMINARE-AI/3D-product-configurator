import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import ThreeDGen from "../components/3DGen/ThreeDGen.jsx"; 
import {useAuth} from "../hooks/useAuth";



function ThreeDPage() {
   const isLoggedIn = useAuth();
  return (
    <>
      <Header buttonLabel={isLoggedIn ? "LogOut" : "Login"} />
      <ThreeDGen />
      <Footer />
    </>
  );
}

export default ThreeDPage;