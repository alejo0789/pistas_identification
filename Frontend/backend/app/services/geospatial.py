import os
import logging
import aiofiles
import httpx
from pathlib import Path
import numpy as np
from datetime import datetime

# Set up logging
logger = logging.getLogger(__name__)

# Create images directory if it doesn't exist
IMAGES_DIR = Path("./images")
IMAGES_DIR.mkdir(exist_ok=True)

async def fetch_satellite_image(latitude: float, longitude: float, analysis_id: int) -> str:
    """
    Fetch a satellite image for the given coordinates.
    
    In a production environment, this would use a real satellite imagery API.
    For this implementation, we'll use a placeholder approach.
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        analysis_id: ID of the analysis
        
    Returns:
        Path to the downloaded image, or None if the download failed
    """
    try:
        # In a real implementation, this would call a satellite imagery API
        # For example: Google Earth Engine, Sentinel Hub, Planet, etc.
        
        # For this implementation, we'll use a placeholder approach:
        # 1. Generate a unique filename based on coordinates and analysis ID
        # 2. Download a placeholder satellite image or generate one
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"satellite_{analysis_id}_{timestamp}.jpg"
        image_path = IMAGES_DIR / filename
        
        # For demo purposes, download a placeholder satellite image
        # In a real app, this would be replaced with an actual API call
        placeholder_url = "https://api.placeholder.com/1024x1024"
        
        # Use httpx for async HTTP requests
        async with httpx.AsyncClient() as client:
            try:
                # Try to download from placeholder service
                response = await client.get(placeholder_url, timeout=30)
                response.raise_for_status()
                
                # Save the image
                async with aiofiles.open(image_path, 'wb') as f:
                    await f.write(response.content)
                
                logger.info(f"Downloaded placeholder image for analysis {analysis_id}")
                return str(image_path)
                
            except httpx.HTTPError:
                # If placeholder service fails, generate a basic image
                logger.warning(f"Failed to download placeholder, generating synthetic image for analysis {analysis_id}")
                return await generate_synthetic_satellite_image(latitude, longitude, image_path)
                
    except Exception as e:
        logger.exception(f"Error fetching satellite image: {str(e)}")
        return None

async def generate_synthetic_satellite_image(latitude: float, longitude: float, image_path: Path) -> str:
    """
    Generate a synthetic satellite image for testing purposes.
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        image_path: Path to save the generated image
        
    Returns:
        Path to the generated image
    """
    try:
        # Import PIL here to avoid circular imports
        from PIL import Image, ImageDraw
        
        # Create a blank image (1024x1024 pixels)
        width, height = 1024, 1024
        image = Image.new('RGB', (width, height), color='#1a5276')  # Dark blue base color
        
        # Get a drawing context
        draw = ImageDraw.Draw(image)
        
        # Use latitude and longitude to seed some random patterns
        # This ensures the same coordinates always produce the same image
        import random
        seed = int(abs(latitude * 100) + abs(longitude * 100))
        random.seed(seed)
        
        # Draw some land masses (greenish)
        for _ in range(5):
            x1 = random.randint(0, width)
            y1 = random.randint(0, height)
            x2 = x1 + random.randint(100, 400)
            y2 = y1 + random.randint(100, 400)
            draw.ellipse([x1, y1, x2, y2], fill='#2ecc71', outline='#27ae60')
        
        # Add some roads or rivers (gray lines)
        for _ in range(10):
            x1 = random.randint(0, width)
            y1 = random.randint(0, height)
            x2 = random.randint(0, width)
            y2 = random.randint(0, height)
            draw.line([x1, y1, x2, y2], fill='#95a5a6', width=3)
        
        # Add some buildings (small white rectangles)
        for _ in range(50):
            x = random.randint(0, width)
            y = random.randint(0, height)
            size = random.randint(5, 15)
            draw.rectangle([x, y, x+size, y+size], fill='#ecf0f1')
        
        # Add an airport runway if latitude is positive (just for demo)
        if latitude > 0:
            center_x = width // 2
            center_y = height // 2
            runway_length = 300
            runway_width = 30
            draw.rectangle(
                [center_x - runway_width//2, center_y - runway_length//2,
                 center_x + runway_width//2, center_y + runway_length//2],
                fill='#7f8c8d'
            )
            
            # Add a few aircraft near the runway
            for _ in range(3):
                x = center_x + random.randint(-100, 100)
                y = center_y + random.randint(-150, 150)
                draw.ellipse([x-5, y-5, x+5, y+5], fill='#e74c3c')
        
        # Save the image
        image.save(image_path)
        logger.info(f"Generated synthetic satellite image at {image_path}")
        
        return str(image_path)
        
    except Exception as e:
        logger.exception(f"Error generating synthetic image: {str(e)}")
        return None

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the Haversine distance between two points.
    
    Args:
        lat1: Latitude of first point
        lon1: Longitude of first point
        lat2: Latitude of second point
        lon2: Longitude of second point
        
    Returns:
        Distance in kilometers
    """
    # Implementation of the Haversine formula
    from math import radians, sin, cos, sqrt, atan2
    
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    # Radius of earth in kilometers
    radius = 6371.0
    
    # Calculate the distance
    distance = radius * c
    
    return distance