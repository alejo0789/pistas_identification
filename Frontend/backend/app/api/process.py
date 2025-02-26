"""
Image processing API endpoints
"""
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from ..database import db
from ..models.analysis import Analysis
from ..models.analysis_settings import AnalysisSettings
from ..utils.validators import validate_coordinates
from ..services.image_processing import process_image, queue_image_processing
from ..services.object_detection import detect_objects
from ..services.geospatial import fetch_satellite_image
from . import process_bp

def allowed_file(filename):
    """
    Check if file has an allowed extension
    
    Args:
        filename (str): Filename to check
        
    Returns:
        bool: True if file extension is allowed
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'tif', 'tiff'}

@process_bp.route('/recent', methods=['POST'])
@jwt_required()
def process_recent():
    """
    Process a recent satellite image for the given coordinates
    
    Returns:
        JSON: Processing status and analysis ID
    """
    identity = get_jwt_identity()
    user_id = identity.get('id')
    
    # Get analysis ID from request
    analysis_id = request.form.get('analysis_id')
    if not analysis_id:
        return jsonify({'error': 'Analysis ID is required'}), 400
    
    analysis = Analysis.query.get(analysis_id)
    if not analysis:
        return jsonify({'error': 'Analysis not found'}), 404
    
    # Check permission (user's own analysis or admin)
    if analysis.user_id != user_id and not identity.get('is_admin', False):
        return jsonify({'error': 'Permission denied'}), 403
    
    # Get user settings
    settings = AnalysisSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        settings = AnalysisSettings(user_id=user_id)
        db.session.add(settings)
        db.session.commit()
    
    try:
        # Get satellite image
        image_data, image_date = fetch_satellite_image(
            float(analysis.latitude), 
            float(analysis.longitude)
        )
        
        if not image_data:
            return jsonify({'error': 'Failed to retrieve satellite image'}), 500
        
        # Save image to file
        upload_folder = current_app.config['UPLOAD_FOLDER']
        filename = f"analysis_{analysis.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
        image_path = os.path.join(upload_folder, filename)
        
        with open(image_path, 'wb') as f:
            f.write(image_data)
        
        # Process image
        processed_image = process_image(image_path)
        
        # Detect objects
        detection_results = detect_objects(
            processed_image,
            detect_runways=settings.detect_runways,
            detect_aircraft=settings.detect_aircraft,
            detect_houses=settings.detect_houses,
            detect_roads=settings.detect_roads,
            detect_water_bodies=settings.detect_water_bodies
        )
        
        # Update analysis with results
        analysis.image_path = image_path
        analysis.image_date = image_date
        analysis.runway_detected = detection_results.get('runway_detected', False)
        analysis.aircraft_count = detection_results.get('aircraft_count', 0)
        analysis.house_count = detection_results.get('house_count', 0)
        analysis.road_count = detection_results.get('road_count', 0)
        analysis.water_body_count = detection_results.get('water_body_count', 0)
        analysis.geojson_data = detection_results.get('geojson_data')
        
        db.session.commit()
        
        return jsonify({
            'message': 'Image processed successfully',
            'analysis': analysis.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500

@process_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    """
    Upload and process a custom satellite image
    
    Returns:
        JSON: Processing status and analysis ID
    """
    identity = get_jwt_identity()
    user_id = identity.get('id')
    
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Get analysis ID from request
    analysis_id = request.form.get('analysis_id')
    if not analysis_id:
        return jsonify({'error': 'Analysis ID is required'}), 400
    
    analysis = Analysis.query.get(analysis_id)
    if not analysis:
        return jsonify({'error': 'Analysis not found'}), 404
    
    # Check permission (user's own analysis or admin)
    if analysis.user_id != user_id and not identity.get('is_admin', False):
        return jsonify({'error': 'Permission denied'}), 403
    
    if file and allowed_file(file.filename):
        # Get user settings
        settings = AnalysisSettings.query.filter_by(user_id=user_id).first()
        if not settings:
            settings = AnalysisSettings(user_id=user_id)
            db.session.add(settings)
            db.session.commit()
        
        try:
            # Save uploaded file
            filename = secure_filename(file.filename)
            upload_folder = current_app.config['UPLOAD_FOLDER']
            image_path = os.path.join(upload_folder, f"analysis_{analysis.id}_{filename}")
            file.save(image_path)
            
            # Process image
            processed_image = process_image(image_path)
            
            # Detect objects
            detection_results = detect_objects(
                processed_image,
                detect_runways=settings.detect_runways,
                detect_aircraft=settings.detect_aircraft,
                detect_houses=settings.detect_houses,
                detect_roads=settings.detect_roads,
                detect_water_bodies=settings.detect_water_bodies
            )
            
            # Update analysis with results
            analysis.image_path = image_path
            analysis.image_date = datetime.strptime(
                request.form.get('image_date', datetime.now().strftime('%Y-%m-%d')),
                '%Y-%m-%d'
            )
            analysis.runway_detected = detection_results.get('runway_detected', False)
            analysis.aircraft_count = detection_results.get('aircraft_count', 0)
            analysis.house_count = detection_results.get('house_count', 0)
            analysis.road_count = detection_results.get('road_count', 0)
            analysis.water_body_count = detection_results.get('water_body_count', 0)
            analysis.geojson_data = detection_results.get('geojson_data')
            
            db.session.commit()
            
            return jsonify({
                'message': 'Image uploaded and processed successfully',
                'analysis': analysis.to_dict()
            }), 200
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Failed to process image: {str(e)}'}), 500
    
    return jsonify({'error': 'File type not allowed'}), 400

@process_bp.route('/temporal', methods=['POST'])
@jwt_required()
def process_temporal():
    """
    Process temporal comparison between two satellite images
    
    Returns:
        JSON: Comparison results
    """
    identity = get_jwt_identity()
    user_id = identity.get('id')
    
    # Get required parameters
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON in request'}), 400
    
    if not all(k in data for k in ['analysis_id', 'start_date', 'end_date']):
        return jsonify({'error': 'Missing required parameters'}), 400
    
    analysis_id = data['analysis_id']
    start_date = data['start_date']
    end_date = data['end_date']
    
    # Get analysis
    analysis = Analysis.query.get(analysis_id)
    if not analysis:
        return jsonify({'error': 'Analysis not found'}), 404
    
    # Check permission (user's own analysis or admin)
    if analysis.user_id != user_id and not identity.get('is_admin', False):
        return jsonify({'error': 'Permission denied'}), 403
    
    # This feature would require more complex implementation
    # For now, return a placeholder
    return jsonify({
        'message': 'Temporal analysis is not implemented yet',
        'analysis_id': analysis_id,
        'start_date': start_date,
        'end_date': end_date
    }), 501