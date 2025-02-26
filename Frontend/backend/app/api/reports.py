"""
Report generation API endpoints
"""
from flask import request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from ..database import db
from ..models.analysis import Analysis
from ..services.report_generator import generate_ppt_report
from . import reports_bp

@reports_bp.route('/<int:analysis_id>', methods=['GET'])
@jwt_required()
def generate_report(analysis_id):
    """
    Generate a PPT report for a specific analysis
    
    Args:
        analysis_id (int): Analysis ID
        
    Returns:
        File: PPT report file for download
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
    
    # Check if analysis has been processed
    if not analysis.image_path or not os.path.exists(analysis.image_path):
        return jsonify({'error': 'Analysis has not been processed yet'}), 400
    
    try:
        # Generate PPT report
        reports_folder = current_app.config['REPORTS_FOLDER']
        report_filename = f"report_{analysis.id}.pptx"
        report_path = os.path.join(reports_folder, report_filename)
        
        # Generate report
        generate_ppt_report(analysis, report_path)
        
        # Update analysis with report path
        analysis.ppt_path = report_path
        db.session.commit()
        
        # Return file for download
        return send_file(
            report_path,
            as_attachment=True,
            download_name=f"Satellite_Analysis_Report_{analysis.name}.pptx",
            mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to generate report: {str(e)}'}), 500

@reports_bp.route('/<int:analysis_id>/preview', methods=['GET'])
@jwt_required()
def preview_report(analysis_id):
    """
    Get a report preview for a specific analysis
    
    Args:
        analysis_id (int): Analysis ID
        
    Returns:
        JSON: Report preview data
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
    
    # Build report preview
    preview = {
        'title': f"Satellite Image Analysis: {analysis.name}",
        'coordinates': f"Coordinates: {analysis.latitude}, {analysis.longitude}",
        'date': analysis.image_date.strftime('%Y-%m-%d') if analysis.image_date else 'Unknown',
        'summary': {
            'runway_detected': analysis.runway_detected,
            'aircraft_count': analysis.aircraft_count,
            'house_count': analysis.house_count,
            'road_count': analysis.road_count,
            'water_body_count': analysis.water_body_count
        }
    }
    
    return jsonify({'preview': preview}), 200