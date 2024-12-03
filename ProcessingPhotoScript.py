import os
from PIL import Image

def process_photos(input_dir, output_dir, target_size=(800, 800)):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    for filename in os.listdir(input_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            with Image.open(os.path.join(input_dir, filename)) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize maintaining aspect ratio
                img.thumbnail(target_size)
                
                # Save as JPEG with quality optimization
                output_path = os.path.join(output_dir, f"{os.path.splitext(filename)[0]}.jpg")
                img.save(output_path, 'JPEG', quality=85)

# Usage
process_photos('raw_photos/male', 'backend/static/calibration_photos/male')
process_photos('raw_photos/female', 'backend/static/calibration_photos/female')