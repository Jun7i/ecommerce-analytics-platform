// Vercel serverless function
import express from 'express';
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
app.get('/', (req, res) => {
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
app.get('/api/health', (req, res) => {
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
app.get('/api/products', async (req, res) => {
    console.log("Received request for /api/products");
    try {
        const result = await pool.query('SELECT id, title, vendor, status FROM products ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error executing query for products', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * @route   GET /api/kpis
 * @desc    Get key performance indicators
 * @access  Public
 */
app.get('/api/kpis', async (req, res) => {
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

/**
 * @route   GET /api/recent-sales
 * @desc    Get sales data for the last 30 days for charting
 * @access  Public
 */
app.get('/api/recent-sales', async (req, res) => {
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

// Export for Vercel
export default app;