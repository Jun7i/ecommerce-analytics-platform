import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

// --- API Routes ---

/**
 * @route   GET /
 * @desc    Health check endpoint
 * @access  Public
 */
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ 
        message: "E-commerce Analytics API is running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * @route   GET /api/health
 * @desc    API health check
 * @access  Public
 */
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: "healthy",
        timestamp: new Date().toISOString(),
        database_host: process.env.DB_HOST || 'not configured'
    });
});

/**
 * @route   GET /api/products
 * @desc    Get all products from the database
 * @access  Public
 */
app.get('/api/products', async (req: Request, res: Response) => {
    console.log("Received request for /api/products");
    try {
        const result = await pool.query(
            'SELECT id, title, vendor, product_type, handle, tags,status FROM products ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error executing query for products', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// NEW: Endpoint to calculate and return key performance indicators (KPIs).
/**
 * @route   GET /api/kpis
 * @desc    Get key performance indicators
 * @access  Public
 */
app.get('/api/kpis', async (req: Request, res: Response) => {
    console.log("Received request for /api/kpis");
    try {
        // Check if orders and customers tables exist
        const checkTablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('orders', 'customers');
        `;
        
        console.log("Checking for tables existence...");
        const tablesResult = await pool.query(checkTablesQuery);
        const existingTables = tablesResult.rows.map(row => row.table_name);
        console.log("Found tables:", existingTables);
        
        let kpis = {
            total_sales: 0,
            total_orders: 0,
            new_customers_past_30_days: 0
        };

        // Only query tables that exist
        if (existingTables.includes('orders')) {
            console.log("Querying orders table for sales and order count...");
            const totalSalesQuery = `SELECT SUM(total_price::numeric) AS total_sales FROM orders;`;
            const totalOrdersQuery = `SELECT COUNT(*) AS total_orders FROM orders;`;

            const [salesResult, ordersResult] = await Promise.all([
                pool.query(totalSalesQuery),
                pool.query(totalOrdersQuery)
            ]);
            
            console.log("Sales query result:", salesResult.rows[0]);
            console.log("Orders count result:", ordersResult.rows[0]);
            
            kpis.total_sales = parseFloat(salesResult.rows[0].total_sales) || 0;
            kpis.total_orders = parseInt(ordersResult.rows[0].total_orders) || 0;
        } else {
            console.log("Orders table not found!");
        }

        if (existingTables.includes('customers')) {
            console.log("Querying customers table for new customers...");
            const newCustomersQuery = `SELECT COUNT(*) AS new_customers_past_30_days FROM customers WHERE created_at >= NOW() - INTERVAL '30 days';`;
            const customersResult = await pool.query(newCustomersQuery);
            console.log("New customers result:", customersResult.rows[0]);
            kpis.new_customers_past_30_days = parseInt(customersResult.rows[0].new_customers_past_30_days) || 0;
        } else {
            console.log("Customers table not found!");
        }

        console.log("Final KPIs:", kpis);
        res.status(200).json(kpis);
    } catch (error) {
        console.error('Error executing query for KPIs', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// NEW: Endpoint to get sales data aggregated by day for the last 30 days.
/**
 * @route   GET /api/recent-sales
 * @desc    Get sales data for the last 30 days for charting
 * @access  Public
 */
app.get('/api/recent-sales', async (req: Request, res: Response) => {
    console.log("Received request for /api/recent-sales");
    try {
        // Check if orders table exists
        const checkTableQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'orders';
        `;
        
        const tableResult = await pool.query(checkTableQuery);
        
        if (tableResult.rows.length === 0) {
            // Orders table doesn't exist, return empty array
            console.log("Orders table doesn't exist, returning empty sales data");
            res.status(200).json([]);
            return;
        }

        const salesQuery = `
            SELECT 
                DATE(created_at) as date, 
                SUM(total_price::numeric) as daily_sales
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY date ASC;
        `;
        const result = await pool.query(salesQuery);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error executing query for recent sales', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route   GET /api/customers
 * @desc    Get all customers from the database
 * @access  Public
 */
app.get('/api/customers', async (req: Request, res: Response) => {
    console.log("Received request for /api/customers");
    try {
        // Check if customers table exists
        const checkTableQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'customers';
        `;
        
        const tableResult = await pool.query(checkTableQuery);
        
        if (tableResult.rows.length === 0) {
            console.log("Customers table doesn't exist, returning empty array");
            res.status(200).json([]);
            return;
        }

        const customersQuery = `
            SELECT 
                id, 
                first_name, 
                last_name, 
                email,
                COALESCE(total_spent::numeric, 0) as total_spent,
                COALESCE(orders_count, 0) as orders_count,
                created_at
            FROM customers 
            ORDER BY created_at DESC 
            LIMIT 100;
        `;
        
        const result = await pool.query(customersQuery);
        console.log(`Found ${result.rows.length} customers`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error executing query for customers', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route   GET /api/orders
 * @desc    Get all orders from the database
 * @access  Public
 */
app.get('/api/orders', async (req: Request, res: Response) => {
    console.log("Received request for /api/orders");
    try {
        // Check if orders table exists
        const checkTableQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'orders';
        `;
        
        const tableResult = await pool.query(checkTableQuery);
        
        if (tableResult.rows.length === 0) {
            console.log("Orders table doesn't exist, returning empty array");
            res.status(200).json([]);
            return;
        }

        const ordersQuery = `
            SELECT 
                o.id,
                o.total_price::numeric as total_price,
                o.created_at,
                o.financial_status,
                o.fulfillment_status,
                o.number_of_items,
                c.first_name,
                c.last_name
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            ORDER BY o.created_at DESC 
            LIMIT 100;
        `;
        
        const result = await pool.query(ordersQuery);
        
        // Format the response to match frontend expectations
        const formattedOrders = result.rows.map(row => ({
            id: row.id,
            order_number: `#${row.id}`, // Generate order number from ID since no order_number column exists
            total_price: parseFloat(row.total_price) || 0,
            created_at: row.created_at,
            customer: {
                first_name: row.first_name || 'Unknown',
                last_name: row.last_name || 'Customer'
            },
            financial_status: row.financial_status || 'pending',
            fulfillment_status: row.fulfillment_status || 'unfulfilled',
            number_of_items: row.number_of_items || 0
        }));
        
        console.log(`Found ${formattedOrders.length} orders`);
        res.status(200).json(formattedOrders);
    } catch (error) {
        console.error('Error executing query for orders', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// --- Start Server ---
const PORT = process.env.PORT || 8080;

// For local development only
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Export for Vercel
export default app;
