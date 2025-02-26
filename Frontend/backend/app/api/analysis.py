"""
Analysis API endpoints
"""
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from datetime import datetime
from ..database import db
from ..models.analysis import Analysis
from ..models.analysis_settings import AnalysisSettings
from ..utils.validators import require_json, validate_analysis_input, validate_coordinates
from . import analysis_bp

@analysis_bp.route('', methods=['POST'])
@jwt_required()
@require_json
def create_analysis():
    """
    Create a new analysis
    
    Returns:
        JSON: Created analysis data
    """
    identity = get_jwt_identity()
    user_id = identity.get('id')
    
    data = request.get_json()
    
    # Validate input data
    is_valid, error_message = validate_analysis_input(data)
    if not is_valid:
        return jsonify({'error': error_message}), 400
    
    # Create analysis object
    analysis = Analysis(
        user_id=user_id,
        name=data['name'],
        latitude=data['latitude'],
        longitude=data['longitude']
    )
    
    # Apply detection settings
    settings = AnalysisSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        # Create default settings if they don't exist
        settings = AnalysisSettings(user_id=user_id)
        db.session.add(settings)
    
    # Schedule for processing (this will be implemented in process.py)
    
    try:
        db.session.add(analysis)
        db.session.commit()
        
        # Start image processing in background (will be implemented later)
        # process_image.delay(analysis.id)
        
        return jsonify({
            'message': 'Analysis created successfully',
            'analysis': analysis.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create analysis: {str(e)}'}), 500

@analysis_bp.route('', methods=['GET'])
@jwt_required()
def get_analyses():
    """
    Get all analyses for the current user
    
    Returns:
        JSON: List of analyses
    """
    identity = get_jwt_identity()
    user_id = identity.get('id')
    is_admin = identity.get('is_admin', False)
    
    # Get query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')
    
    # Build query
    query = Analysis.query
    
    # Filter by user if not admin
    if not is_admin:
        query = query.filter_by(user_id=user_id)
    
    # Apply search if provided
    if search:
        query = query.filter(Analysis.name.ilike(f'%{search}%'))
    
    # Order by date (newest first)
    query = query.order_by(Analysis.created_at.desc())
    
    # Paginate results
    analyses_page = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'analyses': [analysis.to_dict() for analysis in analyses_page.items],
        'total': analyses_page.total,
        'pages': analyses_page.pages,
        'page': page,
        'per_page': per_page
    }), 200

@analysis_bp.route('/<int:analysis_id>', methods=['GET'])
@jwt_required()
def get_analysis(analysis_id):
    """
    Get a specific analysis
    
    Args:
        analysis_id (int): Analysis ID
        
    Returns:
        JSON: Analysis data
    """
    identity = get_jwt_identity()
    user_id = identity.get('id')
    is_admin = identity.get('is_admin', False)
    
    analysis = Analysis.query.get(analysis_id)
    if not analysis:
        return jsonify({'error': 'Analysis not found'}), 404
    
    # Check permission (user's own analysis or admin)
    if analysis.user_id != user_id and not is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    
    return jsonify({'analysis': analysis.to_dict()}), 200

@analysis_bp.route('/<int:analysis_id>', methods=['DELETE'])
@jwt_required()
def delete_analysis(analysis_id):
    """
    Delete a specific analysis
    
    Args:
        analysis_id (int): Analysis ID
        
    Returns:
        JSON: Success message
    """
    identity = get_jwt_identity()
    user_id = identity.get('id')
    is_admin = identity.get('is_admin', False)
    
    analysis = Analysis.query.get(analysis_id)
    if not analysis:
        return jsonify({'error': 'Analysis not found'}), 404
    
    # Check permission (user's own analysis or admin)
    if analysis.user_id != user_id and not is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    
    # Delete associated files if they exist
    if analysis.image_path and os.path.exists(analysis.image_path):
        os.remove(analysis.image_path)
    
    if analysis.ppt_path and os.path.exists(analysis.ppt_path):
        os.remove(analysis.ppt_path)
    
    try:
        db.session.delete(analysis)
        db.session.commit()
        return jsonify({'message': 'Analysis deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete analysis: {str(e)}'}), 500

@analysis_bp.route('/<int:analysis_id>/geojson', methods=['GET'])
@jwt_required()
def get_analysis_geojson(analysis_id):
    """
    Get GeoJSON data for a specific analysis
    
    Args:
        analysis_id (int): Analysis ID
        
    Returns:
        JSON: GeoJSON data
    """
    identity = get_jwt_identity()
    user_id = identity.get('id')
    is_admin = identity.get('is_admin', False)
    
    analysis = Analysis.query.get(analysis_id)
    if not analysis:
        return jsonify({'error': 'Analysis not found'}), 404
    
    # Check permission (user's own analysis or admin)
    if analysis.user_id != user_id and not is_admin:
        return jsonify({'error': 'Permission denied'}), 403
    
    if not analysis.geojson_data:
        return jsonify({'error': 'GeoJSON data not available'}), 404
    
    return jsonify(analysis.geojson_data), 200