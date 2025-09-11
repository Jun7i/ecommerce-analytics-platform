-- setup_db.sql
-- This script creates the initial 'products' table.
-- You can run this file directly using a tool like DBeaver or pgAdmin,
-- or by using the command: psql -d ecommerce_analytics -a -f setup_db.sql

-- Drop the table if it already exists to ensure a clean slate
DROP TABLE IF EXISTS products;

-- Create the products table
CREATE TABLE products (
    id BIGINT PRIMARY KEY, -- Using the Shopify product ID as the primary key
    title VARCHAR(255) NOT NULL,
    vendor VARCHAR(255),
    product_type VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    handle VARCHAR(255), -- This is the URL-friendly version of the title
    status VARCHAR(50),
    tags TEXT,
    -- For simplicity, we'll store the variant info as a JSONB field.
    -- This is powerful for querying semi-structured data in PostgreSQL.
    variants JSONB,
    -- Timestamps for tracking when the record was last updated in our system
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a comment to the table for clarity
COMMENT ON TABLE products IS 'Stores product information synced from Shopify.';
