import os
from django.core.management.base import BaseCommand
from core.models import Photo

class Command(BaseCommand):
    help = 'Load calibration photos into the database'

    def handle(self, *args, **options):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        photos_dir = os.path.join(base_dir, 'static', 'calibration_photos')
        
        self.stdout.write(f'Looking for photos in: {photos_dir}')
        
        # Clear existing calibration photos
        Photo.objects.all().delete()
        
        # Process male photos
        male_dir = os.path.join(photos_dir, 'male')
        if os.path.exists(male_dir):
            for filename in os.listdir(male_dir):
                if filename.endswith('.jpg') and not filename.startswith('.'):
                    Photo.objects.create(
                        image_url=f'/static/calibration_photos/male/{filename}',
                        gender='M',
                        age=25  # Default age for calibration photos
                    )
                    self.stdout.write(f'Added male photo: {filename}')
        else:
            self.stdout.write(f'Male directory not found at: {male_dir}')

        # Process female photos
        female_dir = os.path.join(photos_dir, 'female')
        if os.path.exists(female_dir):
            for filename in os.listdir(female_dir):
                if filename.endswith('.jpg') and not filename.startswith('.'):
                    Photo.objects.create(
                        image_url=f'/static/calibration_photos/female/{filename}',
                        gender='F',
                        age=25  # Default age for calibration photos
                    )
                    self.stdout.write(f'Added female photo: {filename}')
        else:
            self.stdout.write(f'Female directory not found at: {female_dir}')

        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {Photo.objects.count()} calibration photos')) 