"""
Analysis Settings model definition
"""
from sqlalchemy.sql import func
from ..database import db

class AnalysisSettings(db.Model):
    """Model for storing user preferences for analysis"""
    __tablename__ = 'analysis_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    detect_runways = db.Column(db.Boolean, default=True)
    detect_aircraft = db.Column(db.Boolean, default=True)
    detect_houses = db.Column(db.Boolean, default=True)
    detect_roads = db.Column(db.Boolean, default=True)
    detect_water_bodies = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = db.relationship('User', back_populates='settings')
    
    def __init__(self, user_id, detect_runways=True, detect_aircraft=True, 
                 detect_houses=True, detect_roads=True, detect_water_bodies=True):
        self.user_id = user_id
        self.detect_runways = detect_runways
        self.detect_aircraft = detect_aircraft
        self.detect_houses = detect_houses
        self.detect_roads = detect_roads
        self.detect_water_bodies = detect_water_bodies
    
    def to_dict(self):
        """Convert settings object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'detect_runways': self.detect_runways,
            'detect_aircraft': self.detect_aircraft,
            'detect_houses': self.detect_houses,
            'detect_roads': self.detect_roads,
            'detect_water_bodies': self.detect_water_bodies
        }