"""
Analysis model definition
"""
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from ..database import db

class Analysis(db.Model):
    """Analysis model for storing satellite image analysis results"""
    __tablename__ = 'analysis'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Numeric(10, 8), nullable=False)
    longitude = db.Column(db.Numeric(11, 8), nullable=False)
    analysis_date = db.Column(db.DateTime(timezone=True), server_default=func.now())
    image_date = db.Column(db.DateTime(timezone=True))
    runway_detected = db.Column(db.Boolean, default=False)
    aircraft_count = db.Column(db.Integer, default=0)
    house_count = db.Column(db.Integer, default=0)
    road_count = db.Column(db.Integer, default=0)
    water_body_count = db.Column(db.Integer, default=0)
    geojson_data = db.Column(JSONB)  # PostgreSQL JSON data type
    image_path = db.Column(db.String(255))
    ppt_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = db.relationship('User', back_populates='analyses')
    
    def __init__(self, user_id, name, latitude, longitude, image_date=None):
        self.user_id = user_id
        self.name = name
        self.latitude = latitude
        self.longitude = longitude
        self.image_date = image_date
    
    def to_dict(self):
        """Convert analysis object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'latitude': float(self.latitude),
            'longitude': float(self.longitude),
            'analysis_date': self.analysis_date.isoformat() if self.analysis_date else None,
            'image_date': self.image_date.isoformat() if self.image_date else None,
            'runway_detected': self.runway_detected,
            'aircraft_count': self.aircraft_count,
            'house_count': self.house_count,
            'road_count': self.road_count,
            'water_body_count': self.water_body_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }