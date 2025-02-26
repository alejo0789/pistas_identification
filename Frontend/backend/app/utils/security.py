"""
Security utilities for password hashing and JWT token handling
"""
import hashlib
import os
from flask_jwt_extended import create_access_token

def hash_password(password):
    """
    Hash a password using SHA-256 with a random salt
    
    Note: In a production environment, use a more secure method like bcrypt
    """
    salt = os.urandom(32)
    hash_obj = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000
    )
    return salt.hex() + '$' + hash_obj.hex()

def check_password(password, stored_hash):
    """
    Verify a password against its stored hash
    """
    salt_hex, hash_hex = stored_hash.split('$')
    salt = bytes.fromhex(salt_hex)
    hash_obj = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000
    )
    return hash_obj.hex() == hash_hex

def generate_token(user):
    """
    Generate a JWT token for a user
    """
    identity = {
        'id': user.id,
        'username': user.username,
        'is_admin': user.is_admin
    }
    return create_access_token(identity=identity)