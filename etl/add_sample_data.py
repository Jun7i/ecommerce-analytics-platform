import os
import psycopg2
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random

# Load environment variables
load_dotenv()

# Database connection details
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            connect_timeout=30,
            sslmode='require'
        )
        print("Database connection successful!")
        return conn
    except psycopg2.OperationalError as e:
        print(f"Error connecting to the database: {e}")
        return None

def add_sample_data():
    """Add sample customers and orders data for testing."""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cur:
            # Add sample customers
            print("Adding sample customers...")
            customers_data = [
                (1001, 'john.doe@example.com', 'John', 'Doe', 3, 299.99, 'enabled', datetime.now() - timedelta(days=45)),
                (1002, 'jane.smith@example.com', 'Jane', 'Smith', 2, 149.99, 'enabled', datetime.now() - timedelta(days=20)),
                (1003, 'bob.wilson@example.com', 'Bob', 'Wilson', 1, 79.99, 'enabled', datetime.now() - timedelta(days=10)),
                (1004, 'alice.brown@example.com', 'Alice', 'Brown', 4, 399.99, 'enabled', datetime.now() - timedelta(days=5)),
                (1005, 'charlie.davis@example.com', 'Charlie', 'Davis', 1, 89.99, 'enabled', datetime.now() - timedelta(days=2))
            ]
            
            for customer in customers_data:
                cur.execute("""
                    INSERT INTO customers (id, email, first_name, last_name, orders_count, total_spent, state, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        email = EXCLUDED.email,
                        first_name = EXCLUDED.first_name,
                        last_name = EXCLUDED.last_name,
                        orders_count = EXCLUDED.orders_count,
                        total_spent = EXCLUDED.total_spent,
                        state = EXCLUDED.state,
                        created_at = EXCLUDED.created_at;
                """, customer)
            
            # Add sample orders
            print("Adding sample orders...")
            orders_data = [
                (2001, 1001, 99.99, 'paid', 'fulfilled', 2, datetime.now() - timedelta(days=40)),
                (2002, 1001, 149.99, 'paid', 'fulfilled', 3, datetime.now() - timedelta(days=35)),
                (2003, 1001, 50.01, 'paid', 'fulfilled', 1, datetime.now() - timedelta(days=30)),
                (2004, 1002, 75.99, 'paid', 'fulfilled', 2, datetime.now() - timedelta(days=18)),
                (2005, 1002, 74.00, 'paid', 'fulfilled', 1, datetime.now() - timedelta(days=15)),
                (2006, 1003, 79.99, 'paid', 'fulfilled', 1, datetime.now() - timedelta(days=8)),
                (2007, 1004, 199.99, 'paid', 'fulfilled', 4, datetime.now() - timedelta(days=4)),
                (2008, 1004, 99.99, 'paid', 'fulfilled', 2, datetime.now() - timedelta(days=3)),
                (2009, 1004, 50.00, 'paid', 'fulfilled', 1, datetime.now() - timedelta(days=2)),
                (2010, 1004, 50.01, 'paid', 'fulfilled', 1, datetime.now() - timedelta(days=1)),
                (2011, 1005, 89.99, 'paid', 'fulfilled', 1, datetime.now() - timedelta(hours=12))
            ]
            
            for order in orders_data:
                cur.execute("""
                    INSERT INTO orders (id, customer_id, total_price, financial_status, fulfillment_status, number_of_items, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        customer_id = EXCLUDED.customer_id,
                        total_price = EXCLUDED.total_price,
                        financial_status = EXCLUDED.financial_status,
                        fulfillment_status = EXCLUDED.fulfillment_status,
                        number_of_items = EXCLUDED.number_of_items,
                        created_at = EXCLUDED.created_at;
                """, order)
            
            conn.commit()
            print("Sample data added successfully!")
            
            # Show some statistics
            cur.execute("SELECT COUNT(*) FROM customers;")
            customer_count = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM orders;")
            order_count = cur.fetchone()[0]
            
            cur.execute("SELECT SUM(total_price) FROM orders;")
            total_sales = cur.fetchone()[0]
            
            print(f"\nDatabase statistics:")
            print(f"  - Customers: {customer_count}")
            print(f"  - Orders: {order_count}")
            print(f"  - Total Sales: ${total_sales}")
            
            return True
            
    except Exception as e:
        print(f"Error adding sample data: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("Adding sample data for testing...")
    success = add_sample_data()
    
    if success:
        print("\nSample data added successfully!")
        print("You can now test your APIs with real data.")
    else:
        print("\nFailed to add sample data.")
    
    print("Done.")