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

def setup_database():
    """
    Creates the products table using the setup_db.sql file.
    """
    print("Setting up database schema...")
    
    # Get the directory of this script and construct path to SQL file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sql_file_path = os.path.join(script_dir, 'setup_db.sql')
    
    # Read the SQL setup file
    with open(sql_file_path, 'r') as file:
        setup_sql = file.read()
    
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
            print("Executing setup SQL...")
            cur.execute(setup_sql)
            conn.commit()
            print("Database schema created successfully!")
            
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error setting up database: {e}")
        return False

if __name__ == "__main__":
    success = setup_database()
    if success:
        print("You can now run the ETL script!")
    else:
        print("Please check the error and try again.")