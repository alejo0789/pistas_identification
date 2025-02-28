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
        
        example:
        
        runway_detected=True,
        aircraf_count=3,
        house_count=2,
        road_count=3,
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
        longitude=data['longitude'],
    )
    
    # Apply detection settings
    settings = AnalysisSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        # Create default settings if they don't exist
        settings = AnalysisSettings(user_id=user_id)
        db.session.add(settings)
    
    # Add demo data that would normally come from the external model
    # This will be replaced with real model output in production
    analysis.runway_detected = True
    analysis.aircraft_count = 3
    analysis.house_count = 2
    analysis.road_count = 3
    analysis.water_body_count = 1
    
    try:
        db.session.add(analysis)
        db.session.commit()
        
        # Start image processing in background (will be implemented later)
        # process_image.delay(analysis.id)
        
        # Return success with analysis data
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
    
    # If this is a record with no analysis yet, populate with demo data
    if not any([analysis.runway_detected, analysis.aircraft_count, analysis.house_count, analysis.road_count]):
        # Add demo data to match what would come from model
        analysis.runway_detected = True
        analysis.aircraft_count = 3
        analysis.house_count = 2
        analysis.road_count = 3
        analysis.water_body_count = 1
        
        # Save the changes
        db.session.commit()
    
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
        # Return demo GeoJSON if real data isn't available
        longitude = float(analysis.longitude)
        latitude = float(analysis.latitude)
        
        demo_geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "type": "runway",
                        "id": 1,
                        "area": 15000
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[longitude - 0.01, latitude - 0.005],
                                        [longitude + 0.01, latitude - 0.005],
                                        [longitude + 0.01, latitude + 0.005],
                                        [longitude - 0.01, latitude + 0.005],
                                        [longitude - 0.01, latitude - 0.005]]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "type": "aircraft",
                        "id": 1
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [longitude - 0.005, latitude + 0.002]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "type": "aircraft",
                        "id": 2
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [longitude + 0.005, latitude - 0.001]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "type": "aircraft",
                        "id": 3
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [longitude, latitude]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "type": "house",
                        "id": 1
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [longitude - 0.008, latitude - 0.003]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "type": "house",
                        "id": 2
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [longitude - 0.007, latitude - 0.004]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "type": "road",
                        "id": 1,
                        "length": 1200
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [longitude - 0.01, latitude - 0.01],
                            [longitude + 0.01, latitude + 0.01]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "type": "road",
                        "id": 2,
                        "length": 800
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [longitude - 0.01, latitude + 0.01],
                            [longitude + 0.01, latitude - 0.01]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "type": "road",
                        "id": 3,
                        "length": 500
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [longitude, latitude - 0.01],
                            [longitude, latitude + 0.01]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "type": "water_body",
                        "id": 1,
                        "area": 5000
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[longitude - 0.007, latitude + 0.007],
                                        [longitude - 0.004, latitude + 0.007],
                                        [longitude - 0.004, latitude + 0.004],
                                        [longitude - 0.007, latitude + 0.004],
                                        [longitude - 0.007, latitude + 0.007]]]
                    }
                }
            ]
        }
        
        # Save this demo GeoJSON to the analysis for future requests
        analysis.geojson_data = demo_geojson
        db.session.commit()
        
        return jsonify(demo_geojson), 200
    
    return jsonify(analysis.geojson_data), 200