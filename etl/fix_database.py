import os
import psycopg2
from dotenv import load_dotenv

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

def check_tables():
    """Check which tables exist in the database."""
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        with conn.cursor() as cur:
            # Check what tables exist
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cur.fetchall()
            print("Existing tables:")
            for table in tables:
                print(f"  - {table[0]}")
            
            # Check if customers and orders tables exist
            missing_tables = []
            table_names = [table[0] for table in tables]
            
            if 'customers' not in table_names:
                missing_tables.append('customers')
            if 'orders' not in table_names:
                missing_tables.append('orders')
                
            if missing_tables:
                print(f"\nMissing tables: {missing_tables}")
                return missing_tables
            else:
                print("\nAll required tables exist!")
                return []
                
    except Exception as e:
        print(f"Error checking tables: {e}")
        return None
    finally:
        conn.close()

def create_missing_tables():
    """Create the customers and orders tables."""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cur:
            # Read and execute the update_db.sql file
            with open('update_db.sql', 'r') as f:
                sql_content = f.read()
            
            print("Creating customers and orders tables...")
            cur.execute(sql_content)
            conn.commit()
            print("Tables created successfully!")
            return True
            
    except Exception as e:
        print(f"Error creating tables: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("Checking database setup...")
    missing_tables = check_tables()
    
    if missing_tables:
        response = input(f"\nDo you want to create the missing tables {missing_tables}? (y/n): ")
        if response.lower() == 'y':
            success = create_missing_tables()
            if success:
                print("Database setup completed!")
                check_tables()  # Verify tables were created
            else:
                print("Failed to create tables.")
        else:
            print("Skipping table creation.")
    
    print("Database check completed.")