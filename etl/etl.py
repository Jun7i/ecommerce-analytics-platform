import os
import requests
import psycopg2
from dotenv import load_dotenv

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

def get_shopify_products():
    """
    Fetches all products from the Shopify store using the Admin API.
    """
    api_url = f"https://{SHOPIFY_STORE_URL}/admin/api/{SHOPIFY_API_VERSION}/products.json"
    headers = {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
    }
    
    print("Fetching products from Shopify...")
    try:
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)
        products = response.json().get('products', [])
        print(f"Successfully fetched {len(products)} products.")
        return products
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from Shopify API: {e}")
        return None

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
        print("Troubleshooting tips:")
        print("1. Check if your internet connection is working")
        print("2. Verify the Supabase project is still active")
        print("3. Check if the database credentials are correct")
        print("4. Try connecting from Supabase dashboard to verify the database is running")
        print("5. Check if IPv6 connectivity is working on your system")
        
        # Try alternative connection method
        print("\nTrying alternative connection method...")
        try:
            # Try using connection URI format
            connection_uri = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require"
            conn = psycopg2.connect(connection_uri)
            print("Database connection successful using URI format!")
            return conn
        except psycopg2.OperationalError as e2:
            print(f"Alternative connection method also failed: {e2}")
            return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None

def insert_products_into_db(products):
    """
    Inserts a list of product records into the 'products' table.
    It uses an 'ON CONFLICT' clause to update existing products.
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
                # The 'variants' field is converted to a JSON string for storage
                import json
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

# --- Main Execution ---

if __name__ == "__main__":
    print("Starting ETL process...")
    shopify_products = get_shopify_products()
    
    if shopify_products:
        insert_products_into_db(shopify_products)
        
    print("ETL process finished.")
