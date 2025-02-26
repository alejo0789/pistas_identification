"""
Database connection and utilities
"""
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func

# Initialize SQLAlchemy instance
db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the application"""
    with app.app_context():
        # Import models here to avoid circular imports
        from app.models.user import User
        from app.models.analysis_settings import AnalysisSettings
        from app.models.analysis import Analysis
        
        # Create all tables
        db.create_all()
        
        # Create a default admin user if none exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@example.com',
                password='adminpassword',  # Change this in production
                is_admin=True
            )
            db.session.add(admin)
            db.session.flush()  # Get the admin ID
            
            # Create default settings for admin
            admin_settings = AnalysisSettings(user_id=admin.id)
            db.session.add(admin_settings)
            
            db.session.commit()
            print("Default admin user created!")
            
        print("Database initialized successfully!")