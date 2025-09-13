// API service for fetching data from your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface Product {
  id: number;
  title: string;
  vendor: string;
  product_type: string;
  status: string;
  price?: number;
  inventory_quantity?: number;
}

export interface KPIData {
  total_sales: number;
  total_orders: number;
  new_customers_past_30_days: number;
  average_order_value?: number;
}

export interface SalesData {
  date: string;
  daily_sales: number;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  total_spent: number;
  orders_count: number;
}

export interface Order {
  id: number;
  order_number: string;
  total_price: number;
  created_at: string;
  customer: {
    first_name: string;
    last_name: string;
  };
  financial_status: string;
}

class ApiService {
  private async fetchApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    return response.json();
  }

  // Get KPI summary data
  async getKPIs(): Promise<KPIData> {
    return this.fetchApi<KPIData>('/api/kpis');
  }

  // Get products data
  async getProducts(): Promise<Product[]> {
    return this.fetchApi<Product[]>('/api/products');
  }

  // Get recent sales data for charts
  async getRecentSales(): Promise<SalesData[]> {
    const data = await this.fetchApi<SalesData[]>('/api/recent-sales');
    // Format dates for better display
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }

  // Get customers data
  async getCustomers(): Promise<Customer[]> {
    return this.fetchApi<Customer[]>('/api/customers');
  }

  // Get orders data
  async getOrders(): Promise<Order[]> {
    return this.fetchApi<Order[]>('/api/orders');
  }

  // Get all dashboard data at once
  async getDashboardData() {
    try {
      const [kpis, products, sales, customers, orders] = await Promise.all([
        this.getKPIs(),
        this.getProducts(),
        this.getRecentSales(),
        this.getCustomers(),
        this.getOrders()
      ]);

      return {
        kpis,
        products,
        sales,
        customers,
        orders,
        error: null
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      return {
        kpis: null,
        products: [],
        sales: [],
        customers: [],
        orders: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;