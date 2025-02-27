# File: Frontend/backend/test_auth.py
# Authentication Testing and Debugging Utility

import os
import sys
import json
import hashlib
from datetime import datetime, timedelta

# Add the parent directory to sys.path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__)))
sys.path.append(parent_dir)

try:
    from app import create_app
    from app.database import db
    from app.models.user import User
    from app.models.analysis_settings import AnalysisSettings
    from app.utils.security import hash_password, check_password, generate_token
    
    print("Successfully imported application modules")
except ImportError as e:
    print(f"Error importing application modules: {e}")
    sys.exit(1)

def test_password_hashing():
    """Test password hashing and verification functionality"""
    print("\n--- Testing Password Hashing ---")
    
    test_password = "TestPassword123"
    
    # Hash the password
    hashed = hash_password(test_password)
    print(f"Original password: {test_password}")
    print(f"Hashed password: {hashed}")
    
    # Verify correct password
    verification = check_password(test_password, hashed)
    print(f"Correct password verification: {verification}")
    
    # Verify incorrect password
    wrong_verification = check_password("WrongPassword123", hashed)
    print(f"Incorrect password verification: {wrong_verification}")
    
    return verification and not wrong_verification

def create_test_user(app):
    """Create a test user in the database"""
    print("\n--- Creating Test User ---")
    
    with app.app_context():
        # Check if test user already exists
        existing_user = User.query.filter_by(username="testuser").first()
        if existing_user:
            print(f"Test user already exists (id: {existing_user.id})")
            return existing_user
            
        # Create a new test user
        try:
            test_user = User(
                username="testuser",
                email="testuser@example.com",
                password="TestPassword123",
                is_admin=True
            )
            
            db.session.add(test_user)
            db.session.flush()  # Get the user ID
            
            # Create settings for the user
            settings = AnalysisSettings(user_id=test_user.id)
            db.session.add(settings)
            
            db.session.commit()
            print(f"Created test user with id: {test_user.id}")
            return test_user
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating test user: {str(e)}")
            return None

def test_token_generation(app, user):
    """Test JWT token generation and validation"""
    print("\n--- Testing Token Generation ---")
    
    with app.app_context():
        # Generate token
        token = generate_token(user)
        print(f"Generated token: {token[:20]}...{token[-20:]}")
        
        # In a real test, we would validate the token, but for now just return it
        return token

def test_login_api(app, username, password):
    """Test the login API endpoint"""
    print("\n--- Testing Login API ---")
    
    with app.app_context():
        with app.test_client() as client:
            # Call the login endpoint
            response = client.post(
                "/api/auth/login",
                json={"username": username, "password": password},
                content_type="application/json"
            )
            
            status_code = response.status_code
            response_data = json.loads(response.data)
            
            print(f"Login response status: {status_code}")
            print(f"Login response data: {json.dumps(response_data, indent=2)}")
            
            return response_data if status_code == 200 else None

def test_auth_flow():
    """Test the entire authentication flow"""
    print("\n=== Authentication Flow Test ===")
    
    # Create application instance
    app = create_app()
    
    # Test password hashing
    if not test_password_hashing():
        print("❌ Password hashing test failed")
        return False
    print("✅ Password hashing test passed")
    
    # Create test user
    user = create_test_user(app)
    if not user:
        print("❌ Test user creation failed")
        return False
    print("✅ Test user created successfully")
    
    # Test token generation
    token = test_token_generation(app, user)
    if not token:
        print("❌ Token generation failed")
        return False
    print("✅ Token generation successful")
    
    # Test login API
    login_result = test_login_api(app, "testuser", "TestPassword123")
    if not login_result:
        print("❌ Login API test failed")
        return False
    print("✅ Login API test successful")
    
    print("\n🎉 All authentication tests passed!")
    return True

if __name__ == "__main__":
    success = test_auth_flow()
    sys.exit(0 if success else 1)