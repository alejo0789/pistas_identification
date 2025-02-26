"""
User management API endpoints
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..database import db
from ..models.user import User
from ..models.analysis_settings import AnalysisSettings
from ..utils.validators import require_json, validate_email
from . import users_bp

@users_bp.route('', methods=['GET'])
@jwt_required()
def get_users():
    """
    Get all users (admin only)
    
    Returns:
        JSON: List of users
    """
    # Check if current user is admin
    identity = get_jwt_identity()
    if not identity.get('is_admin', False):
        return jsonify({'error': 'Admin permission required'}), 403
    
    users = User.query.all()
    return jsonify({'users': [user.to_dict() for user in users]}), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """
    Get a specific user (admin or self)
    
    Args:
        user_id (int): User ID
        
    Returns:
        JSON: User data
    """
    # Check if current user is admin or requesting their own info
    identity = get_jwt_identity()
    if not identity.get('is_admin', False) and identity.get('id') != user_id:
        return jsonify({'error': 'Permission denied'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
@require_json
def update_user(user_id):
    """
    Update a user (admin or self)
    
    Args:
        user_id (int): User ID
        
    Returns:
        JSON: Updated user data
    """
    # Check if current user is admin or updating their own info
    identity = get_jwt_identity()
    if not identity.get('is_admin', False) and identity.get('id') != user_id:
        return jsonify({'error': 'Permission denied'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update fields if provided
    if 'email' in data:
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if email is already taken by another user
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != user_id:
            return jsonify({'error': 'Email already registered'}), 409
        
        user.email = data['email']
    
    # Only admins can change admin status
    if 'is_admin' in data and identity.get('is_admin', False):
        user.is_admin = data['is_admin']
    
    # Handle password change
    if 'password' in data:
        from ..utils.security import hash_password
        from ..utils.validators import validate_password_strength
        
        if not validate_password_strength(data['password']):
            return jsonify({'error': 'Password not strong enough'}), 400
        
        user.password_hash = hash_password(data['password'])
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update user: {str(e)}'}), 500

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """
    Delete a user (admin only)
    
    Args:
        user_id (int): User ID
        
    Returns:
        JSON: Success message
    """
    # Check if current user is admin
    identity = get_jwt_identity()
    if not identity.get('is_admin', False):
        return jsonify({'error': 'Admin permission required'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete user: {str(e)}'}), 500

@users_bp.route('/<int:user_id>/settings', methods=['GET'])
@jwt_required()
def get_user_settings(user_id):
    """
    Get a user's analysis settings (admin or self)
    
    Args:
        user_id (int): User ID
        
    Returns:
        JSON: User settings
    """
    # Check if current user is admin or requesting their own info
    identity = get_jwt_identity()
    if not identity.get('is_admin', False) and identity.get('id') != user_id:
        return jsonify({'error': 'Permission denied'}), 403
    
    settings = AnalysisSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        return jsonify({'error': 'Settings not found'}), 404
    
    return jsonify({'settings': settings.to_dict()}), 200

@users_bp.route('/<int:user_id>/settings', methods=['PUT'])
@jwt_required()
@require_json
def update_user_settings(user_id):
    """
    Update a user's analysis settings (admin or self)
    
    Args:
        user_id (int): User ID
        
    Returns:
        JSON: Updated settings
    """
    # Check if current user is admin or updating their own settings
    identity = get_jwt_identity()
    if not identity.get('is_admin', False) and identity.get('id') != user_id:
        return jsonify({'error': 'Permission denied'}), 403
    
    settings = AnalysisSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        # Create settings if they don't exist
        settings = AnalysisSettings(user_id=user_id)
        db.session.add(settings)
    
    data = request.get_json()
    
    # Update settings fields if provided
    if 'detect_runways' in data:
        settings.detect_runways = data['detect_runways']
    
    if 'detect_aircraft' in data:
        settings.detect_aircraft = data['detect_aircraft']
    
    if 'detect_houses' in data:
        settings.detect_houses = data['detect_houses']
    
    if 'detect_roads' in data:
        settings.detect_roads = data['detect_roads']
    
    if 'detect_water_bodies' in data:
        settings.detect_water_bodies = data['detect_water_bodies']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Settings updated successfully',
            'settings': settings.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update settings: {str(e)}'}), 500