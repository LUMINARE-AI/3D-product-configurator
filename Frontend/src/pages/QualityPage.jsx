import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useAuth } from "../hooks/useAuth";
import QualityCheck from "../components/QualityCheck/QualityCheck";

const QualityPage = () => {
  const isLoggedIn = useAuth();
    return (
    <>
      <Header buttonLabel={isLoggedIn ? "Logout" : "Login"} /> 
      <QualityCheck />
      <Footer />
    </>
  );
}   

export default QualityPage;