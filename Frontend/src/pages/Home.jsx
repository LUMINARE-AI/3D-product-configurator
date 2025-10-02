import Banner from "../components/Banner/Banner.jsx";
import Service from "../components/Services/ServiceCard.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Header from "../components/Header/Header.jsx";
import { useAuth } from "../hooks/useAuth";

function Home() {
  const isLoggedIn = useAuth();

  return (
    <>
      <Header buttonLabel={isLoggedIn ? "LogOut" : "Login"} />
      <Banner />
      <Service />
      <Footer />
    </>
  );
}

export default Home;