import os
import logging
import time
from datetime import datetime
from sqlalchemy.orm import Session
import requests

from app.models.analysis import Analysis
from app.services.object_detection import detect_objects
from app.services.geospatial import fetch_satellite_image

logger = logging.getLogger(__name__)

async def process_image(analysis_id: int, db: Session):
    """
    Process a satellite image for the given analysis.
    
    This function:
    1. Updates the analysis status to "processing"
    2. Fetches the satellite image for the given coordinates
    3. Runs object detection on the image
    4. Updates the analysis with the results
    """
    try:
        # Get the analysis from the database
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            logger.error(f"Analysis {analysis_id} not found")
            return
        
        # Update status to processing
        analysis.status = "processing"
        db.commit()
        
        # Fetch satellite image
        image_path = await fetch_satellite_image(
            latitude=analysis.latitude,
            longitude=analysis.longitude,
            analysis_id=analysis.id
        )
        
        if not image_path:
            logger.error(f"Failed to fetch satellite image for analysis {analysis_id}")
            analysis.status = "failed"
            db.commit()
            return
        
        # Update image URL
        image_filename = os.path.basename(image_path)
        analysis.image_url = f"/api/v1/images/{image_filename}"
        db.commit()
        
        # Perform object detection
        detection_results = await detect_objects(
            image_path=image_path,
            detect_runways=analysis.detect_runways,
            detect_aircraft=analysis.detect_aircraft,
            detect_houses=analysis.detect_houses,
            detect_roads=analysis.detect_roads,
            detect_water_bodies=analysis.detect_water_bodies
        )
        
        if not detection_results:
            logger.error(f"Object detection failed for analysis {analysis_id}")
            analysis.status = "failed"
            db.commit()
            return
        
        # Update analysis with results
        analysis.status = "completed"
        analysis.result_image_url = f"/api/v1/images/{detection_results['result_image_filename']}"
        analysis.runway_detected = detection_results.get('runway_detected', False)
        analysis.aircraft_count = detection_results.get('aircraft_count', 0)
        analysis.house_count = detection_results.get('house_count', 0)
        analysis.details = detection_results.get('details', {})
        analysis.analysis_date = datetime.utcnow()
        
        db.commit()
        logger.info(f"Analysis {analysis_id} completed successfully")
        
    except Exception as e:
        logger.exception(f"Error processing analysis {analysis_id}: {str(e)}")
        
        # Update analysis status to failed
        try:
            analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
            if analysis:
                analysis.status = "failed"
                db.commit()
        except Exception as db_error:
            logger.exception(f"Error updating analysis status: {str(db_error)}")

def queue_image_processing(analysis_id: int, db: Session):
    """
    Queue the image processing task.
    
    In a production environment, this would send the task to a message queue
    or task queue like Celery. For this implementation, we'll simply run the
    task with a small delay to simulate background processing.
    """
    try:
        # Simulate task queuing with a small delay
        time.sleep(1)
        
        # For now, process directly (in a real app, this would be handled by a worker)
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(process_image(analysis_id, db))
        loop.close()
        
    except Exception as e:
        logger.exception(f"Error queuing image processing task: {str(e)}")
        
        # Update analysis status to failed
        try:
            analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
            if analysis:
                analysis.status = "failed"
                db.commit()
        except Exception as db_error:
            logger.exception(f"Error updating analysis status: {str(db_error)}")