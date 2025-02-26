"""
Flask application factory
"""
import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import get_config
from .database import db, init_db

# Import API route registrations
from .api import register_blueprints

def create_app(config_name=None):
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(get_config())
    
    # Setup CORS
    CORS(app)
    
    # Initialize database
    init_db(app)
    
    # Setup JWT
    jwt = JWTManager(app)
    
    # Create upload and reports folders if they don't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['REPORTS_FOLDER'], exist_ok=True)
    
    # Register API routes
    register_blueprints(app)
    
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        return {'status': 'ok'}
    
    return app