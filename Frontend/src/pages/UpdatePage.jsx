import Footer from '../components/Footer/Footer.jsx';
import Header from '../components/Header/Header.jsx';
import UpdateProduct from "../components/Products/UpdateProduct";
import { useAuth } from "../hooks/useAuth";

function UpdateProductPage() {
    const isLoggedIn = useAuth();
    return(
        <>
        <Header buttonLabel={isLoggedIn ? "LogOut" : "Login"}/>
        <div className='bg-[linear-gradient(180deg,#E2F3FF_20.3%,#FFFFFF_80.71%)]'>
           <UpdateProduct/> 
        </div>
        <Footer />
        </>
    )
}
export default UpdateProductPage