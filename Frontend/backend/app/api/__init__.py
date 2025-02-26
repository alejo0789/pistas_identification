"""
API routes registration
"""
from flask import Blueprint

# Create blueprints for different API sections
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
users_bp = Blueprint('users', __name__, url_prefix='/api/users')
analysis_bp = Blueprint('analysis', __name__, url_prefix='/api/analysis')
process_bp = Blueprint('process', __name__, url_prefix='/api/process')
reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

# Import routes to register them with blueprints
from .auth import *
from .users import *
from .analysis import *
from .process import *
from .reports import *

def register_blueprints(app):
    """
    Register all API blueprints with the Flask app
    
    Args:
        app: Flask application instance
    """
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(process_bp)
    app.register_blueprint(reports_bp)