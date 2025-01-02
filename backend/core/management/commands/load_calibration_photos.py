import os
import re
import shutil
import filecmp
from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.conf import settings
from core.models import Photo

class Command(BaseCommand):
    help = 'Load and validate calibration photos into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force reload all photos',
        )

    def validate_photo_filename(self, filename):
        """Validate photo filename matches the 6-digit format."""
        if not filename.endswith('.jpg'):
            return False
        basename = os.path.splitext(filename)[0]
        return bool(re.match(r'^\d{6}$', basename))

    def process_directory(self, directory, gender):
        """Process photos in a directory and report issues."""
        valid_photos = []
        issues = []
        
        if not os.path.exists(directory):
            self.stdout.write(self.style.ERROR(f'{gender} directory not found at: {directory}'))
            return [], [f'Missing directory: {directory}']

        self.stdout.write(f'Scanning directory: {directory}')
        
        for filename in os.listdir(directory):
            if filename.startswith('.'):
                self.stdout.write(f'Skipping hidden file: {filename}')
                continue

            if not filename.endswith('.jpg'):
                issues.append(f'Invalid file type: {filename}')
                continue

            if not self.validate_photo_filename(filename):
                issues.append(f'Invalid filename format: {filename} (should be 6 digits)')
                continue

            file_path = os.path.join(directory, filename)
            if not os.path.getsize(file_path):
                issues.append(f'Empty file: {filename}')
                continue

            self.stdout.write(f'Found valid photo: {filename}')
            valid_photos.append(filename)

        self.stdout.write(f'Found {len(valid_photos)} valid photos in {directory}')
        return valid_photos, issues

    def handle(self, *args, **options):
        force_reload = options['force']
        
        # Clear cache if force reload
        if force_reload:
            cache.delete('calibration_photos_m')
            cache.delete('calibration_photos_f')
            self.stdout.write('Cleared photo cache')
            
            # Clean up old records
            Photo.objects.filter(image__isnull=True).delete()
            self.stdout.write('Cleaned up old photo records')

        # Source directories
        source_male = os.path.join(settings.BASE_DIR, 'static', 'calibration_photos', 'male')
        source_female = os.path.join(settings.BASE_DIR, 'static', 'calibration_photos', 'female')

        # Target directories in staticfiles
        target_male = os.path.join(settings.STATIC_ROOT, 'calibration_photos', 'male')
        target_female = os.path.join(settings.STATIC_ROOT, 'calibration_photos', 'female')

        # Create target directories if they don't exist
        os.makedirs(target_male, exist_ok=True)
        os.makedirs(target_female, exist_ok=True)

        # Process male photos
        self.stdout.write('Processing male photos...')
        male_photos, male_issues = self.process_directory(source_male, 'Male')
        
        # Process female photos
        self.stdout.write('Processing female photos...')
        female_photos, female_issues = self.process_directory(source_female, 'Female')

        # Report issues
        all_issues = male_issues + female_issues
        if all_issues:
            self.stdout.write(self.style.WARNING('Issues found:'))
            for issue in all_issues:
                self.stdout.write(f'  - {issue}')

        # Process male photos
        for filename in male_photos:
            if filename.startswith('.'):
                continue
                
            source = os.path.join(source_male, filename)
            target = os.path.join(target_male, filename)
            
            # Copy file if it doesn't exist or is different
            if not os.path.exists(target) or not filecmp.cmp(source, target, shallow=False):
                shutil.copy2(source, target)
                self.stdout.write(f'Copied {filename} to staticfiles')
            
            # Create or update database record
            photo_id = int(os.path.splitext(filename)[0])
            Photo.objects.update_or_create(
                id=photo_id,
                defaults={
                    'gender': 'M',
                    'image': None
                }
            )
            self.stdout.write(f'Created/updated database record for {filename}')

        # Process female photos
        for filename in female_photos:
            if filename.startswith('.'):
                continue
                
            source = os.path.join(source_female, filename)
            target = os.path.join(target_female, filename)
            
            # Copy file if it doesn't exist or is different
            if not os.path.exists(target) or not filecmp.cmp(source, target, shallow=False):
                shutil.copy2(source, target)
                self.stdout.write(f'Copied {filename} to staticfiles')
            
            # Create or update database record
            photo_id = int(os.path.splitext(filename)[0])
            Photo.objects.update_or_create(
                id=photo_id,
                defaults={
                    'gender': 'F',
                    'image': None
                }
            )
            self.stdout.write(f'Created/updated database record for {filename}')

        # Report results
        male_count = Photo.objects.filter(gender='M', image__isnull=True).count()
        female_count = Photo.objects.filter(gender='F', image__isnull=True).count()
        
        self.stdout.write(self.style.SUCCESS(f'Successfully processed:'))
        self.stdout.write(f'  - {male_count} male photos')
        self.stdout.write(f'  - {female_count} female photos') 