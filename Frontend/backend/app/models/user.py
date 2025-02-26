"""
User model definition
"""
from datetime import datetime
from sqlalchemy.sql import func
from ..database import db
from ..utils.security import hash_password, check_password

class User(db.Model):
    """User model for authentication and user management"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    analyses = db.relationship('Analysis', back_populates='user', cascade='all, delete-orphan')
    settings = db.relationship('AnalysisSettings', back_populates='user', uselist=False, cascade='all, delete-orphan')
    
    def __init__(self, username, email, password, is_admin=False):
        self.username = username
        self.email = email
        self.password_hash = hash_password(password)
        self.is_admin = is_admin
    
    def verify_password(self, password):
        """Verify a password against the stored hash"""
        return check_password(password, self.password_hash)
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }