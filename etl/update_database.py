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

def update_database():
    """
    Creates the customers and orders tables using the update_db.sql file.
    """
    print("Updating database schema with customers and orders tables...")
    
    # Get the directory of this script and construct path to SQL file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sql_file_path = os.path.join(script_dir, 'update_db.sql')
    
    # Read the SQL update file
    with open(sql_file_path, 'r') as file:
        update_sql = file.read()
    
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            sslmode='require'
        )
        
        with conn.cursor() as cur:
            print("Executing update SQL...")
            cur.execute(update_sql)
            conn.commit()
            print("Database schema updated successfully!")
            print("✅ Customers table created")
            print("✅ Orders table created")
            
        conn.close()
        return True
        
    except psycopg2.errors.DuplicateTable as e:
        print("Tables already exist. This is normal if you've run this before.")
        print(f"Details: {e}")
        return True
    except Exception as e:
        print(f"Error updating database: {e}")
        return False

def check_tables():
    """
    Check what tables exist in the database.
    """
    print("\nChecking existing tables...")
    
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            sslmode='require'
        )
        
        with conn.cursor() as cur:
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cur.fetchall()
            
            if tables:
                print("Current tables in database:")
                for table in tables:
                    print(f"  - {table[0]}")
            else:
                print("No tables found in database.")
        
        conn.close()
        
    except Exception as e:
        print(f"Error checking tables: {e}")

if __name__ == "__main__":
    success = update_database()
    check_tables()
    
    if success:
        print("\n🎉 Database update complete!")
        print("You now have the following tables:")
        print("  - products (for Shopify products)")
        print("  - customers (for Shopify customers)")
        print("  - orders (for Shopify orders)")
    else:
        print("\n❌ Please check the error and try again.")