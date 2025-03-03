"""
Analysis API endpoints
"""
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from datetime import datetime
from ..database import db
from ..models.analysis import Analysis, AnalysisImage
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
        longitude=data['longitude'],
    )
    
    try:
        # Save the analysis to get its ID
        db.session.add(analysis)
        db.session.flush()
        
        # Create an initial image record for this analysis
        # Make sure to only pass parameters that the __init__ method accepts
        image = AnalysisImage(
            analysis_id=analysis.id,
            image_date=datetime.now(),
            source_type='api'
            # Removed 'status' parameter - we'll set it directly instead
        )
        
        # Set additional attributes directly instead of passing to constructor
        image.status = 'pending'
        
        # Apply detection settings
        settings = AnalysisSettings.query.filter_by(user_id=user_id).first()
        if not settings:
            # Create default settings if they don't exist
            settings = AnalysisSettings(user_id=user_id)
            db.session.add(settings)
        
        # Add demo data that would normally come from the external model
        image.runway_detected = True
        image.runway_length = 3000.0  # Example length in meters
        image.runway_width = 45.0     # Example width in meters
        image.aircraft_count = 4
        image.house_count = 2
        image.road_count = 3
        image.water_body_count = 1
        
        db.session.add(image)
        db.session.commit()
        
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
    
    # Get the latest image for this analysis
    latest_image = AnalysisImage.query.filter_by(analysis_id=analysis_id).order_by(AnalysisImage.image_date.desc()).first()
    
    # If no image exists or if image has no analysis yet, create demo data
    if not latest_image:
        # Create a new image with demo data
        latest_image = AnalysisImage(
            analysis_id=analysis_id,
            image_date=datetime.now(),
            source_type='api',
            status='completed',
            runway_detected=True,
            runway_length=3000.0,
            runway_width=45.0,
            aircraft_count=3,
            house_count=2,
            road_count=3,
            water_body_count=1
        )
        
        db.session.add(latest_image)
        db.session.commit()
    
    # Get the analysis data with the latest image included
    response_data = analysis.to_dict()
    
    return jsonify({'analysis': response_data}), 200

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
    
    # Get all images for this analysis
    images = AnalysisImage.query.filter_by(analysis_id=analysis_id).all()
    
    # Delete associated files for each image
    for image in images:
        if image.image_path and os.path.exists(image.image_path):
            os.remove(image.image_path)
        
        if image.ppt_path and os.path.exists(image.ppt_path):
            os.remove(image.ppt_path)
    
    try:
        # The cascade delete will handle removing the images
        db.session.delete(analysis)
        db.session.commit()
        return jsonify({'message': 'Analysis deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete analysis: {str(e)}'}), 500

@analysis_bp.route('/<int:analysis_id>/images', methods=['GET'])
@jwt_required()
def get_analysis_images(analysis_id):
    """
    Get all images for a specific analysis
    
    Args:
        analysis_id (int): Analysis ID
        
    Returns:
        JSON: List of image data
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
    
    # Get all images for this analysis, ordered by date
    images = AnalysisImage.query.filter_by(analysis_id=analysis_id).order_by(AnalysisImage.image_date.desc()).all()
    
    return jsonify({
        'images': [image.to_dict() for image in images]
    }), 200

@analysis_bp.route('/<int:analysis_id>/images/<int:image_id>', methods=['GET'])
@jwt_required()
def get_analysis_image(analysis_id, image_id):
    """
    Get a specific image for an analysis
    
    Args:
        analysis_id (int): Analysis ID
        image_id (int): Image ID
        
    Returns:
        JSON: Image data
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
    
    # Get the specific image
    image = AnalysisImage.query.filter_by(id=image_id, analysis_id=analysis_id).first()
    if not image:
        return jsonify({'error': 'Image not found for this analysis'}), 404
    
    return jsonify({'image': image.to_dict()}), 200

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
    
    # Get the latest image for this analysis
    image = AnalysisImage.query.filter_by(analysis_id=analysis_id).order_by(AnalysisImage.image_date.desc()).first()
    
    if not image or not image.geojson_data:
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
                        "area": 15000,
                        "length": 3000.0,
                        "width": 45.0
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
                        "type": "aircraft",
                        "id": 4
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [longitude - 0.002, latitude - 0.004]
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
        
        # If we have an image, save this demo GeoJSON to it for future requests
        if image:
            image.geojson_data = demo_geojson
            db.session.commit()
        # If we don't have an image yet, create one with this data
        else:
            new_image = AnalysisImage(
                analysis_id=analysis_id,
                image_date=datetime.now(),
                source_type='api',
                status='completed',
                runway_detected=True,
                runway_length=3000.0,
                runway_width=45.0,
                aircraft_count=4,
                house_count=2,
                road_count=3,
                water_body_count=1,
                geojson_data=demo_geojson
            )
            db.session.add(new_image)
            db.session.commit()
        
        return jsonify(demo_geojson), 200
    
    return jsonify(image.geojson_data), 200

@analysis_bp.route('/<int:analysis_id>/images', methods=['POST'])
@jwt_required()
@require_json
def add_analysis_image(analysis_id):
    """
    Add a new image to an existing analysis
    
    Args:
        analysis_id (int): Analysis ID
        
    Returns:
        JSON: Created image data
    """
    identity = get_jwt_identity()
    user_id = identity.get('id')
    
    analysis = Analysis.query.get(analysis_id)
    if not analysis:
        return jsonify({'error': 'Analysis not found'}), 404
    
    # Check permission (user's own analysis or admin)
    if analysis.user_id != user_id and not identity.get('is_admin', False):
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    
    # Create a new image for this analysis
    image = AnalysisImage(
        analysis_id=analysis_id,
        image_date=datetime.now(),
        source_type=data.get('source_type', 'api'),
        status='pending'
    )
    
    # If an image date was provided, use it
    if 'image_date' in data:
        try:
            image.image_date = datetime.strptime(data['image_date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    try:
        db.session.add(image)
        db.session.commit()
        
        # Start image processing in background (will be implemented later)
        # process_image.delay(analysis_id, image.id)
        
        return jsonify({
            'message': 'Image added successfully',
            'image': image.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add image: {str(e)}'}), 500