import { useState, useEffect } from 'react';

// --- Type Definition ---
// It's a best practice in TypeScript to define the "shape" of your data.
// This helps prevent bugs and improves autocompletion.
interface ProductVariant {
  id: number;
  title: string;
  price: string;
  sku: string | null;
  inventory_quantity: number;
}

interface Product {
  id: number;
  title: string;
  vendor: string;
  status: string;
  product_type: string;
  variants: ProductVariant[];
  created_at: string; // Storing as string, will format for display
}


// --- Main App Component ---
function App() {
  // State to hold the list of products fetched from the API
  const [products, setProducts] = useState<Product[]>([]);
  // State to handle loading status while fetching data
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to store any potential errors during the fetch
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch data from your backend API endpoint
        const response = await fetch('http://localhost:8080/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError("An unknown error occurred.");
        }
      } finally {
        // Set loading to false once the fetch is complete (either success or fail)
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // The empty dependency array [] means this effect runs only once

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <p className="text-xl animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-red-400 p-4">
        <h2 className="text-2xl font-bold mb-4">Failed to load data</h2>
        <p className="bg-red-900 p-4 rounded-md text-center">
            Error: {error}<br/><br/>
            Please ensure your backend server is running on `http://localhost:8080` and the database is connected.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">E-commerce Analytics Dashboard</h1>
          <p className="text-gray-400 mt-2">Real-time product data synced from Shopify.</p>
        </header>

        {/* Main Content: Products Table */}
        <main className="bg-gray-800 shadow-2xl rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="p-4 font-semibold text-sm tracking-wider">Product Name</th>
                  <th className="p-4 font-semibold text-sm tracking-wider">Vendor</th>
                  <th className="p-4 font-semibold text-sm tracking-wider">Status</th>
                  <th className="p-4 font-semibold text-sm tracking-wider text-right">Price</th>
                  <th className="p-4 font-semibold text-sm tracking-wider text-right">Inventory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-700/50 transition-colors duration-200">
                    <td className="p-4 whitespace-nowrap">
                        <div className="font-medium text-white">{product.title}</div>
                        <div className="text-xs text-gray-400">{product.product_type || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-gray-300 whitespace-nowrap">{product.vendor}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status.toLowerCase() === 'active' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-300 whitespace-nowrap">${product.variants[0]?.price || '0.00'}</td>
                    <td className="p-4 text-right text-white font-medium whitespace-nowrap">{product.variants[0]?.inventory_quantity || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
