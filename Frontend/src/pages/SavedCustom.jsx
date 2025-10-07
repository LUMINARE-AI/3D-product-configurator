import { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import CustomizationCard from "../components/CustomizationCard";
import Loader from "../components/Animations/Loader";
import { API_URL } from "../config";

const SavedCustom = () => {
  const [customizations, setCustomizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
    const fetchCustomizations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/v1/customizations/all-cust`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Fetched data:", data);
        console.log("Data structure:", JSON.stringify(data, null, 2));
        
        // Handle the specific data structure your backend returns
        let customizationsArray = [];
        if (data.message && Array.isArray(data.message)) {
          // Your current backend structure puts data in 'message' field
          customizationsArray = data.message;
        } else if (data.data && Array.isArray(data.data)) {
          customizationsArray = data.data;
        } else if (Array.isArray(data)) {
          customizationsArray = data;
        } else {
          console.warn("Unexpected data structure:", data);
        }
        
        setCustomizations(customizationsArray);
      } catch (err) {
        console.error("Error fetching customizations:", err);
        setError(err.message);
        // Set empty array on error to prevent UI issues
        setCustomizations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomizations();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div>
        <Header />
        <div className="font-montserrat flex justify-center items-center h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div className="font-montserrat min-h-screen bg-[linear-gradient(180deg,#E2F3FF_20.3%,#FFFFFF_80.71%)] py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Saved Customizations
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              View and manage all your saved product customizations. You can customize them again or delete them as needed.
            </p>
          </div>

          {/* Customizations Grid */}
          <div className="max-w-7xl mx-auto">
            <CustomizationCard 
              customizations={customizations}
              setCustomizations={setCustomizations}
            />
          </div>

          {/* Empty State */}
          {customizations.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Customizations Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't saved any customizations yet. Start by customizing a product and saving it!
                </p>
                <button
                  onClick={() => window.location.href = '/gallery'}
                  className="cursor-pointer px-6 py-3 bg-gradient-to-r from-[#0055B1] to-[#52B0FF] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Browse Products
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SavedCustom;

