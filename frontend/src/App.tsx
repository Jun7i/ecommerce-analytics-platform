import { useState, useEffect } from 'react';
// We need to import the charting components from recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Type Definitions ---
// We keep the Product types, and add new ones for our new data.

interface ProductVariant {
  id: number;
  title: string;
  price: string;
}

interface Product {
  id: number;
  title: string;
  vendor: string;
  status: string;
}

// NEW: Type for the KPI data from /api/kpis
interface KpiData {
  total_sales: number;
  total_orders: number;
  new_customers_past_30_days: number;
}

// NEW: Type for the sales chart data from /api/recent-sales
interface SalesData {
  date: string;
  daily_sales: number;
}


// --- Main App Component ---
function App() {
  // --- State Management ---
  // We add new state variables for our new data.
  const [products, setProducts] = useState<Product[]>([]);
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    // This function is now updated to fetch ALL data in parallel.
    const fetchData = async () => {
      try {
        // Use the environment variable for production, fallback to localhost for development
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        
        // Using Promise.all is more efficient as it fetches all data at the same time.
        const [productsRes, kpisRes, salesRes] = await Promise.all([
            fetch(`${API_URL}/api/products`),
            fetch(`${API_URL}/api/kpis`),
            fetch(`${API_URL}/api/recent-sales`)
        ]);

        if (!productsRes.ok || !kpisRes.ok || !salesRes.ok) {
            throw new Error(`HTTP error! A request failed. Please check the backend console.`);
        }

        const productsData = await productsRes.json();
        const kpisData = await kpisRes.json();
        const salesDataRaw = await salesRes.json();
        
        // We format the sales data slightly for better chart display
        const formattedSales = salesDataRaw.map((d: any) => ({
            date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            daily_sales: parseFloat(d.daily_sales)
        }));

        setProducts(productsData);
        setKpis(kpisData);
        setSalesData(formattedSales);

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        console.error("Failed to fetch data:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  
  // --- Render Logic ---
  // The render logic is now expanded to include the new UI components.

  if (isLoading) { /* ... same as your current code ... */ }
  if (error) { /* ... same as your current code ... */ }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">E-commerce Analytics Dashboard</h1>
          <p className="text-gray-400 mt-2">Real-time business intelligence.</p>
        </header>
        
        {/* NEW: KPI Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium">Total Revenue</h3>
            <p className="text-3xl font-bold text-white mt-2">${kpis?.total_sales.toLocaleString() || '0'}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium">Total Orders</h3>
            <p className="text-3xl font-bold text-white mt-2">{kpis?.total_orders.toLocaleString() || '0'}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium">New Customers (30d)</h3>
            <p className="text-3xl font-bold text-white mt-2">{kpis?.new_customers_past_30_days.toLocaleString() || '0'}</p>
          </div>
        </div>

        {/* NEW: Sales Chart and Products Table Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="font-semibold text-white mb-4">Recent Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}/>
                <Legend />
                <Bar dataKey="daily_sales" fill="#3b82f6" name="Sales ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="lg:col-span-1 bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="font-semibold text-white mb-4">Product Status</h3>
            {/* This could be a list or another simple chart later */}
            <ul className="space-y-3 mt-4">
              {products.slice(0, 5).map(p => (
                 <li key={p.id} className="flex justify-between items-center text-sm">
                   <span className="text-gray-300">{p.title}</span>
                   <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.status.toLowerCase() === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{p.status}</span>
                 </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

