-- update_db.sql
-- This script adds the customers and orders tables.

-- Create the customers table
CREATE TABLE customers (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    orders_count INT,
    total_spent NUMERIC(10, 2),
    state VARCHAR(100), -- e.g., 'enabled', 'disabled'
    created_at TIMESTAMP WITH TIME ZONE,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE customers IS 'Stores customer information synced from Shopify.';

-- Create the orders table
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id), -- Foreign key to the customers table
    total_price NUMERIC(10, 2),
    financial_status VARCHAR(100), -- e.g., 'paid', 'pending', 'refunded'
    fulfillment_status VARCHAR(100),
    number_of_items INT,
    created_at TIMESTAMP WITH TIME ZONE,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Stores order information synced from Shopify.';
