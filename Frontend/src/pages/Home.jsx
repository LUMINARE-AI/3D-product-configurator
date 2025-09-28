import Banner from "../components/Banner/Banner.jsx";
import Service from "../components/Services/ServiceCard.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Header from "../components/Header/Header.jsx";

function Home() {
  return (
    <>
      <Header/>
      <Banner />
      <Service />
      <Footer />
    </>
  );
}

export default Home;
