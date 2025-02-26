# db_test.py
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

def test_database_connection():
    """
    Test database connection using environment variables from .env file
    """
    # Load environment variables from .env
    load_dotenv()
    
    # Get database URL from environment
    database_url = os.environ.get("DATABASE_URL")
    
    if not database_url:
        # If DATABASE_URL is not set, try to construct it from individual components
        engine = os.environ.get("DB_ENGINE_local", "postgresql")
        username = os.environ.get("DB_USERNAME_local", "postgress")
        password = os.environ.get("DB_PASS_local", "root")
        host = os.environ.get("DB_HOST_local", "localhost")
        port = os.environ.get("DB_PORT_local", 5432)
        db_name = os.environ.get("DB_NAME_local", "Db_pistas")
        
        database_url = f"{engine}://{username}:{password}@{host}:{port}/{db_name}"
    
    print(f"Attempting to connect to database with URL: {database_url}")
    
    try:
        # Create a SQLAlchemy engine
        engine = create_engine(database_url)
        
        # Try to connect and execute a simple query
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Database connection successful!")
            
            # Print database version
            db_version = connection.execute(text("SELECT version()")).scalar()
            print(f"Database version: {db_version}")
            
        return True
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)