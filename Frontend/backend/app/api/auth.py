"""
Authentication API endpoints
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..database import db
from ..models.user import User
from ..models.analysis_settings import AnalysisSettings
from ..utils.security import generate_token
from ..utils.validators import require_json, validate_email, validate_password_strength
from . import auth_bp

@auth_bp.route('/login', methods=['POST'])
@require_json
def login():
    """
    User login endpoint
    
    Returns:
        JSON: User data and access token
    """
    data = request.get_json()
    
    # Check for required fields
    if not all(k in data for k in ['username', 'password']):
        return jsonify({'error': 'Missing username or password'}), 400
    
    # Find user by username
    user = User.query.filter_by(username=data['username']).first()
    
    # Check if user exists and password is correct
    if not user or not user.verify_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Generate access token
    token = generate_token(user)
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/register', methods=['POST'])
@require_json
@jwt_required()
def register():
    """
    Register a new user (admin only)
    
    Returns:
        JSON: New user data
    """
    # Check if current user is admin
    identity = get_jwt_identity()
    if not identity.get('is_admin', False):
        return jsonify({'error': 'Admin permission required'}), 403
    
    data = request.get_json()
    
    # Check for required fields
    required_fields = ['username', 'email', 'password']
    if not all(k in data for k in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate inputs
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    if not validate_password_strength(data['password']):
        return jsonify({'error': 'Password not strong enough'}), 400
    
    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new user
    try:
        user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            is_admin=data.get('is_admin', False)
        )
        db.session.add(user)
        db.session.flush()  # Flush to get the user ID
        
        # Create default settings for user
        settings = AnalysisSettings(user_id=user.id)
        db.session.add(settings)
        
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to register user: {str(e)}'}), 500

@auth_bp.route('/user', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current user information
    
    Returns:
        JSON: Current user data
    """
    identity = get_jwt_identity()
    user_id = identity.get('id')
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    User logout endpoint (client-side token deletion)
    
    Note: JWT tokens are stateless, actual invalidation would require a token blacklist
    
    Returns:
        JSON: Success message
    """
    return jsonify({'message': 'Successfully logged out'}), 200