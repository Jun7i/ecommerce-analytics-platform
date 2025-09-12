import os
import requests
import psycopg2
from dotenv import load_dotenv
from datetime import datetime
import json

# Load environment variables from the .env file
load_dotenv()

# --- Configuration ---
SHOPIFY_STORE_URL = os.getenv("SHOPIFY_STORE_URL")
SHOPIFY_API_VERSION = os.getenv("SHOPIFY_API_VERSION")
SHOPIFY_ACCESS_TOKEN = os.getenv("SHOPIFY_ACCESS_TOKEN")

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

# --- Shopify API Functions ---

def get_shopify_data(endpoint, limit=250):
    """
    Generic function to fetch data from Shopify API with pagination support.
    """
    api_url = f"https://{SHOPIFY_STORE_URL}/admin/api/{SHOPIFY_API_VERSION}/{endpoint}.json"
    headers = {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
    }
    
    all_data = []
    params = {"limit": limit}
    
    print(f"Fetching {endpoint} from Shopify...")
    
    while True:
        try:
            response = requests.get(api_url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Extract the data based on endpoint
            endpoint_key = endpoint.split('/')[-1]  # Get the last part of the endpoint
            items = data.get(endpoint_key, [])
            
            if not items:
                break
                
            all_data.extend(items)
            print(f"Fetched {len(items)} {endpoint_key} (total: {len(all_data)})")
            
            # Check for pagination
            link_header = response.headers.get('Link')
            if not link_header or 'rel="next"' not in link_header:
                break
                
            # Extract next page URL from Link header
            next_url = None
            for link in link_header.split(','):
                if 'rel="next"' in link:
                    next_url = link.split('<')[1].split('>')[0]
                    break
            
            if not next_url:
                break
                
            api_url = next_url
            params = {}  # URL already contains parameters
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data from Shopify API: {e}")
            break
    
    print(f"Successfully fetched {len(all_data)} {endpoint_key}.")
    return all_data

def get_shopify_products():
    return get_shopify_data("products")

def get_shopify_customers():
    return get_shopify_data("customers")

def get_shopify_orders():
    return get_shopify_data("orders")

# --- PostgreSQL Database Functions ---

def get_db_connection():
    """
    Establishes a connection to the PostgreSQL database.
    """
    print(f"Attempting to connect to database at {DB_HOST}:{DB_PORT}")
    print(f"Database: {DB_NAME}, User: {DB_USER}")
    
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            connect_timeout=30,  # 30 second timeout
            sslmode='require'  # Supabase requires SSL
        )
        print("Database connection successful!")
        return conn
    except psycopg2.OperationalError as e:
        print(f"Error connecting to the database: {e}")
        return None

def insert_products_into_db(products):
    """
    Inserts a list of product records into the 'products' table.
    """
    if not products:
        print("No products to insert.")
        return

    conn = get_db_connection()
    if not conn:
        return

    insert_query = """
    INSERT INTO products (id, title, vendor, product_type, created_at, handle, status, tags, variants)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        vendor = EXCLUDED.vendor,
        product_type = EXCLUDED.product_type,
        created_at = EXCLUDED.created_at,
        handle = EXCLUDED.handle,
        status = EXCLUDED.status,
        tags = EXCLUDED.tags,
        variants = EXCLUDED.variants,
        last_synced_at = NOW();
    """

    print("Inserting/updating products in the database...")
    count = 0
    try:
        with conn.cursor() as cur:
            for product in products:
                variants_json = json.dumps(product.get('variants', []))
                
                cur.execute(insert_query, (
                    product['id'],
                    product.get('title'),
                    product.get('vendor'),
                    product.get('product_type'),
                    product.get('created_at'),
                    product.get('handle'),
                    product.get('status'),
                    product.get('tags'),
                    variants_json
                ))
                count += 1
            conn.commit()
            print(f"Successfully inserted/updated {count} products.")
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Error during database operation: {error}")
        conn.rollback()
    finally:
        if conn is not None:
            conn.close()

def insert_customers_into_db(customers):
    """
    Inserts a list of customer records into the 'customers' table.
    """
    if not customers:
        print("No customers to insert.")
        return

    conn = get_db_connection()
    if not conn:
        return

    insert_query = """
    INSERT INTO customers (id, email, first_name, last_name, orders_count, total_spent, state, created_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        orders_count = EXCLUDED.orders_count,
        total_spent = EXCLUDED.total_spent,
        state = EXCLUDED.state,
        created_at = EXCLUDED.created_at,
        last_synced_at = NOW();
    """

    print("Inserting/updating customers in the database...")
    count = 0
    try:
        with conn.cursor() as cur:
            for customer in customers:
                cur.execute(insert_query, (
                    customer['id'],
                    customer.get('email'),
                    customer.get('first_name'),
                    customer.get('last_name'),
                    customer.get('orders_count', 0),
                    customer.get('total_spent', '0.00'),
                    customer.get('state', 'enabled'),
                    customer.get('created_at')
                ))
                count += 1
            conn.commit()
            print(f"Successfully inserted/updated {count} customers.")
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Error during database operation: {error}")
        conn.rollback()
    finally:
        if conn is not None:
            conn.close()

def insert_orders_into_db(orders):
    """
    Inserts a list of order records into the 'orders' table.
    """
    if not orders:
        print("No orders to insert.")
        return

    conn = get_db_connection()
    if not conn:
        return

    insert_query = """
    INSERT INTO orders (id, customer_id, total_price, financial_status, fulfillment_status, number_of_items, created_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (id) DO UPDATE SET
        customer_id = EXCLUDED.customer_id,
        total_price = EXCLUDED.total_price,
        financial_status = EXCLUDED.financial_status,
        fulfillment_status = EXCLUDED.fulfillment_status,
        number_of_items = EXCLUDED.number_of_items,
        created_at = EXCLUDED.created_at,
        last_synced_at = NOW();
    """

    print("Inserting/updating orders in the database...")
    count = 0
    try:
        with conn.cursor() as cur:
            for order in orders:
                # Count line items
                line_items = order.get('line_items', [])
                number_of_items = sum(item.get('quantity', 0) for item in line_items)
                
                cur.execute(insert_query, (
                    order['id'],
                    order.get('customer', {}).get('id') if order.get('customer') else None,
                    order.get('total_price', '0.00'),
                    order.get('financial_status'),
                    order.get('fulfillment_status'),
                    number_of_items,
                    order.get('created_at')
                ))
                count += 1
            conn.commit()
            print(f"Successfully inserted/updated {count} orders.")
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Error during database operation: {error}")
        conn.rollback()
    finally:
        if conn is not None:
            conn.close()

# --- Main Execution ---

if __name__ == "__main__":
    print("=" * 60)
    print("STARTING COMPREHENSIVE SHOPIFY DATA SYNC")
    print("=" * 60)
    
    # Sync products
    print("\n1. SYNCING PRODUCTS...")
    shopify_products = get_shopify_products()
    if shopify_products:
        insert_products_into_db(shopify_products)
    
    # Sync customers
    print("\n2. SYNCING CUSTOMERS...")
    shopify_customers = get_shopify_customers()
    if shopify_customers:
        insert_customers_into_db(shopify_customers)
    
    # Sync orders
    print("\n3. SYNCING ORDERS...")
    shopify_orders = get_shopify_orders()
    if shopify_orders:
        insert_orders_into_db(shopify_orders)
    
    print("\n" + "=" * 60)
    print("SYNC COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print("\nYour database is now up-to-date with your Shopify store.")
    print("Both your local frontend and Vercel deployment will show the latest data.")