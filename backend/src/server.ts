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
// Enable CORS for all routes, allowing our frontend to connect
app.use(cors());
// Enable parsing of JSON bodies in requests
app.use(express.json());

// --- Database Connection ---
// Create a PostgreSQL connection pool. A pool is more efficient
// than creating a new client for every single query.
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

// --- API Routes ---

// A simple test route to make sure the server is alive
app.get('/api/test', (req: Request, res: Response) => {
    res.status(200).json({ message: "Server is running and connected!" });
});

/**
 * @route   GET /api/products
 * @desc    Get all products from the database
 * @access  Public
 */
app.get('/api/products', async (req: Request, res: Response) => {
    console.log("Received request for /api/products");
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        // The 'variants' column is stored as a JSON string, so we parse it.
        const products = result.rows.map(p => ({
            ...p,
            variants: typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants
        }));
        res.status(200).json(products);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
