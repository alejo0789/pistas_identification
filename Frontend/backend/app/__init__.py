"""
Flask application factory
"""
import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import get_config
from .database import db, init_db

def create_app(config_name=None):
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(get_config())
    
    # Setup CORS
    CORS(app)
    
    # Initialize database with app
    db.init_app(app)
    
    # Setup JWT
    jwt = JWTManager(app)
    
    # Create upload and reports folders if they don't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['REPORTS_FOLDER'], exist_ok=True)
    
    # Register API routes
    from .api import register_blueprints
    register_blueprints(app)
    
    # Initialize database within app context
    with app.app_context():
        init_db(app)
    
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        return {'status': 'ok'}
    
    return app