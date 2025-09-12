import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

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
 * @route   GET /api/products
 * @desc    Get all products from the database
 * @access  Public
 */
app.get('/api/products', async (req: Request, res: Response) => {
    console.log("Received request for /api/products");
    try {
        const result = await pool.query('SELECT id, title, vendor, status FROM products ORDER BY created_at DESC');
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
        
        const tablesResult = await pool.query(checkTablesQuery);
        const existingTables = tablesResult.rows.map(row => row.table_name);
        
        let kpis = {
            total_sales: 0,
            total_orders: 0,
            new_customers_past_30_days: 0
        };

        // Only query tables that exist
        if (existingTables.includes('orders')) {
            const totalSalesQuery = `SELECT SUM(total_price::numeric) AS total_sales FROM orders;`;
            const totalOrdersQuery = `SELECT COUNT(*) AS total_orders FROM orders;`;

            const [salesResult, ordersResult] = await Promise.all([
                pool.query(totalSalesQuery),
                pool.query(totalOrdersQuery)
            ]);
            
            kpis.total_sales = parseFloat(salesResult.rows[0].total_sales) || 0;
            kpis.total_orders = parseInt(ordersResult.rows[0].total_orders) || 0;
        }

        if (existingTables.includes('customers')) {
            const newCustomersQuery = `SELECT COUNT(*) AS new_customers_past_30_days FROM customers WHERE created_at >= NOW() - INTERVAL '30 days';`;
            const customersResult = await pool.query(newCustomersQuery);
            kpis.new_customers_past_30_days = parseInt(customersResult.rows[0].new_customers_past_30_days) || 0;
        }

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


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
