import React from 'react';
import Footer from '../components/Footer/Footer.jsx';
import Header from '../components/Header/Header.jsx';
import AddPrdoduct from '../components/Products/AddProduct.jsx';
function CreateProduct() {
    return(
        <>
        <Header buttonLabel="LogOut"/>
        <div className='bg-[linear-gradient(180deg,#E2F3FF_20.3%,#FFFFFF_80.71%)]'>
           <AddPrdoduct/> 
        </div>
        
        <Footer />
        </>
    )
}

export default CreateProduct;