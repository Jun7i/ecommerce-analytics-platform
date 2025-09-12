import os
import socket
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

def test_dns_resolution():
    """Test if we can resolve the hostname"""
    print(f"Testing DNS resolution for {DB_HOST}...")
    try:
        # Get all addresses for the hostname
        addresses = socket.getaddrinfo(DB_HOST, DB_PORT, socket.AF_UNSPEC, socket.SOCK_STREAM)
        print("DNS resolution successful!")
        for addr in addresses:
            family, type, proto, canonname, sockaddr = addr
            family_name = "IPv4" if family == socket.AF_INET else "IPv6"
            print(f"  {family_name}: {sockaddr[0]}:{sockaddr[1]}")
        return True
    except socket.gaierror as e:
        print(f"DNS resolution failed: {e}")
        return False

def test_tcp_connection():
    """Test if we can make a TCP connection"""
    print(f"\nTesting TCP connection to {DB_HOST}:{DB_PORT}...")
    try:
        sock = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((DB_HOST, int(DB_PORT)))
        sock.close()
        if result == 0:
            print("TCP connection successful!")
            return True
        else:
            print(f"TCP connection failed with error code: {result}")
            return False
    except Exception as e:
        print(f"TCP connection test failed: {e}")
        
    # Try IPv4
    try:
        print("Trying IPv4...")
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((DB_HOST, int(DB_PORT)))
        sock.close()
        if result == 0:
            print("IPv4 TCP connection successful!")
            return True
        else:
            print(f"IPv4 TCP connection failed with error code: {result}")
            return False
    except Exception as e:
        print(f"IPv4 TCP connection test failed: {e}")
        return False

def test_database_connection():
    """Test the actual database connection"""
    print(f"\nTesting database connection...")
    connection_params = {
        'host': DB_HOST,
        'port': DB_PORT,
        'database': DB_NAME,
        'user': DB_USER,
        'password': DB_PASSWORD,
        'sslmode': 'require',
        'connect_timeout': 30
    }
    
    print(f"Connection parameters:")
    for key, value in connection_params.items():
        if key == 'password':
            print(f"  {key}: {'*' * len(str(value))}")
        else:
            print(f"  {key}: {value}")
    
    try:
        conn = psycopg2.connect(**connection_params)
        print("Database connection successful!")
        
        # Test a simple query
        with conn.cursor() as cur:
            cur.execute("SELECT version();")
            version = cur.fetchone()
            print(f"Database version: {version[0]}")
        
        conn.close()
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("=== Supabase Connection Test ===\n")
    
    dns_ok = test_dns_resolution()
    if dns_ok:
        tcp_ok = test_tcp_connection()
        if tcp_ok:
            db_ok = test_database_connection()
        else:
            print("\nSkipping database test due to TCP connection failure")
    else:
        print("\nSkipping further tests due to DNS resolution failure")
    
    print("\n=== Test Complete ===")
    print("\nIf DNS resolution failed, please:")
    print("1. Check your Supabase project dashboard")
    print("2. Verify the hostname in your .env file")
    print("3. Check if the project is paused or deleted")
    print("4. Try using a different DNS server (like 8.8.8.8)")
    print("5. Check your IPv6 internet connectivity")