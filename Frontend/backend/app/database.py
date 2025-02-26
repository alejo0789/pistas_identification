"""
Database connection and utilities
"""
from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy instance - THIS SHOULD BE THE ONLY INSTANCE IN THE APP
db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the application"""
    # We don't need to call db.init_app(app) here since it's called in app/__init__.py
    # Just create tables and initialize data
    
    # Import models here to avoid circular imports
    from app.models.user import User
    from app.models.analysis_settings import AnalysisSettings
    from app.models.analysis import Analysis
    
    # Create all tables
    db.create_all()
    
    # Create a default admin user if none exists
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        try:
            from app.utils.security import hash_password
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
        except Exception as e:
            print(f"Error creating admin user: {str(e)}")
            db.session.rollback()
    
    print("Database initialized successfully!")