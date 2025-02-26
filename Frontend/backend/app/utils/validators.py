"""
Input validation utilities
"""
import re
from functools import wraps
from flask import request, jsonify

def validate_coordinates(latitude, longitude):
    """
    Validate geographic coordinates
    
    Args:
        latitude (float): Latitude value
        longitude (float): Longitude value
        
    Returns:
        bool: True if coordinates are valid, False otherwise
    """
    try:
        lat = float(latitude)
        lng = float(longitude)
        
        if lat < -90 or lat > 90:
            return False
        
        if lng < -180 or lng > 180:
            return False
        
        return True
    except (ValueError, TypeError):
        return False

def validate_email(email):
    """
    Validate email format
    
    Args:
        email (str): Email to validate
        
    Returns:
        bool: True if email is valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, email))

def validate_password_strength(password):
    """
    Validate password strength
    
    Args:
        password (str): Password to validate
        
    Returns:
        bool: True if password is strong enough, False otherwise
    """
    # At least 8 characters, one uppercase, one lowercase, one digit
    if len(password) < 8:
        return False
    
    if not any(c.isupper() for c in password):
        return False
    
    if not any(c.islower() for c in password):
        return False
    
    if not any(c.isdigit() for c in password):
        return False
    
    return True

def require_json(f):
    """
    Decorator to require JSON content type in request
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({'error': 'Missing JSON in request'}), 400
        return f(*args, **kwargs)
    return decorated_function

def validate_analysis_input(data):
    """
    Validate analysis input data
    
    Args:
        data (dict): Analysis input data
        
    Returns:
        tuple: (is_valid, error_message)
    """
    required_fields = ['name', 'latitude', 'longitude']
    
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    if not validate_coordinates(data.get('latitude'), data.get('longitude')):
        return False, "Invalid coordinates"
    
    return True, None