"""
Updated database schema with separate tables for analysis and analysis images
"""
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from ..database import db

class Analysis(db.Model):
    """Analysis model for storing basic analysis information"""
    __tablename__ = 'analysis'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Numeric(10, 8), nullable=False)
    longitude = db.Column(db.Numeric(11, 8), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = db.relationship('User', back_populates='analyses')
    images = db.relationship('AnalysisImage', back_populates='analysis', cascade='all, delete-orphan')
    
    def __init__(self, user_id, name, latitude, longitude):
        self.user_id = user_id
        self.name = name
        self.latitude = latitude
        self.longitude = longitude
    
    def to_dict(self):
        """Convert analysis object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'latitude': float(self.latitude),
            'longitude': float(self.longitude),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'images': [image.to_dict() for image in self.images]
        }
    
    def get_latest_image(self):
        """Get the most recent image for this analysis"""
        return AnalysisImage.query.filter_by(analysis_id=self.id).order_by(AnalysisImage.image_date.desc()).first()


class AnalysisImage(db.Model):
    """Model for storing analysis images and their detection results"""
    __tablename__ = 'analysis_images'
    
    id = db.Column(db.Integer, primary_key=True)
    analysis_id = db.Column(db.Integer, db.ForeignKey('analysis.id'), nullable=False)
    image_date = db.Column(db.DateTime(timezone=True))
    processing_date = db.Column(db.DateTime(timezone=True), server_default=func.now())
    image_path = db.Column(db.String(255))
    ppt_path = db.Column(db.String(255))
    
    # Detection results
    runway_detected = db.Column(db.Boolean, default=False)
    runway_length = db.Column(db.Float, nullable=True)  # in meters
    runway_width = db.Column(db.Float, nullable=True)   # in meters
    aircraft_count = db.Column(db.Integer, default=0)
    house_count = db.Column(db.Integer, default=0)
    road_count = db.Column(db.Integer, default=0)
    water_body_count = db.Column(db.Integer, default=0)
    
    # GeoJSON for visualization
    geojson_data = db.Column(JSONB)
    
    # Processing status and metadata
    status = db.Column(db.String(20), default='pending')  # pending, processing, completed, failed
    source_type = db.Column(db.String(20))  # 'upload', 'api', 'historical'
    
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    analysis = db.relationship('Analysis', back_populates='images')
    
    def __init__(self, analysis_id, image_date=None, image_path=None, source_type='api'):
        self.analysis_id = analysis_id
        self.image_date = image_date
        self.image_path = image_path
        self.source_type = source_type
    
    def to_dict(self):
        """Convert analysis image object to dictionary"""
        return {
            'id': self.id,
            'analysis_id': self.analysis_id,
            'image_date': self.image_date.isoformat() if self.image_date else None,
            'processing_date': self.processing_date.isoformat() if self.processing_date else None,
            'image_path': self.image_path,
            'runway_detected': self.runway_detected,
            'runway_length': self.runway_length,
            'runway_width': self.runway_width,
            'aircraft_count': self.aircraft_count,
            'house_count': self.house_count,
            'road_count': self.road_count,
            'water_body_count': self.water_body_count,
            'status': self.status,
            'source_type': self.source_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }