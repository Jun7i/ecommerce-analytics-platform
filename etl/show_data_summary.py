import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

def get_db_connection():
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
        return conn
    except psycopg2.OperationalError as e:
        print(f"Error connecting to the database: {e}")
        return None

def show_data_summary():
    """Show a summary of what data we have in the database."""
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        with conn.cursor() as cur:
            print("=" * 60)
            print("DATABASE SUMMARY")
            print("=" * 60)
            
            # Products summary
            cur.execute("SELECT COUNT(*) FROM products;")
            product_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM products WHERE status = 'active';")
            active_products = cur.fetchone()[0]
            print(f"📦 PRODUCTS: {product_count} total ({active_products} active)")
            
            if product_count > 0:
                cur.execute("SELECT title, vendor, status FROM products ORDER BY created_at DESC LIMIT 5;")
                products = cur.fetchall()
                for product in products:
                    status_emoji = "✅" if product[2] == "active" else "📝" if product[2] == "draft" else "📁"
                    print(f"   {status_emoji} {product[0]} ({product[1]}) - {product[2]}")
            
            print()
            
            # Customers summary
            cur.execute("SELECT COUNT(*) FROM customers;")
            customer_count = cur.fetchone()[0]
            print(f"👥 CUSTOMERS: {customer_count}")
            
            if customer_count > 0:
                cur.execute("SELECT first_name, last_name, email, orders_count, total_spent FROM customers ORDER BY created_at DESC LIMIT 5;")
                customers = cur.fetchall()
                for customer in customers:
                    print(f"   👤 {customer[0]} {customer[1]} ({customer[2]}) - {customer[3]} orders, ${customer[4]}")
            
            print()
            
            # Orders summary
            cur.execute("SELECT COUNT(*) FROM orders;")
            order_count = cur.fetchone()[0]
            cur.execute("SELECT SUM(total_price::numeric) FROM orders;")
            total_sales = cur.fetchone()[0] or 0
            print(f"🛍️  ORDERS: {order_count} orders, ${total_sales:.2f} total sales")
            
            if order_count > 0:
                cur.execute("SELECT id, total_price, financial_status, created_at FROM orders ORDER BY created_at DESC LIMIT 5;")
                orders = cur.fetchall()
                for order in orders:
                    date_str = order[3].strftime("%Y-%m-%d %H:%M") if order[3] else "N/A"
                    print(f"   💳 Order #{order[0]} - ${order[1]} ({order[2]}) - {date_str}")
            
            print()
            
            # Real-time vs Sample data
            cur.execute("SELECT COUNT(*) FROM orders WHERE id < 10000;")
            sample_orders = cur.fetchone()[0]
            real_orders = order_count - sample_orders
            
            cur.execute("SELECT COUNT(*) FROM customers WHERE id < 10000;")
            sample_customers = cur.fetchone()[0]
            real_customers = customer_count - sample_customers
            
            print("📊 DATA BREAKDOWN:")
            print(f"   Real Shopify Orders: {real_orders}")
            print(f"   Sample Test Orders: {sample_orders}")
            print(f"   Real Shopify Customers: {real_customers}")
            print(f"   Sample Test Customers: {sample_customers}")
            
            print("=" * 60)
            
    except Exception as e:
        print(f"Error querying database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    show_data_summary()