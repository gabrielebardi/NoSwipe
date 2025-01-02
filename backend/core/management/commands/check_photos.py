from django.core.management.base import BaseCommand
import os
import requests
from django.conf import settings
from core.models import Photo, User, UserPreference
from django.core.cache import cache

class Command(BaseCommand):
    help = 'Verify calibration photos existence and accessibility'

    def verify_photo_exists(self, photo_path):
        """Verify if a photo exists in both source and target directories."""
        source_path = os.path.join(settings.BASE_DIR, 'static', photo_path)
        target_path = os.path.join(settings.STATIC_ROOT, photo_path)
        
        source_exists = os.path.exists(source_path)
        target_exists = os.path.exists(target_path)
        
        # Print detailed path information
        self.stdout.write(f"\nDetailed path check for {photo_path}:")
        self.stdout.write(f"Source path: {source_path}")
        self.stdout.write(f"  - Exists: {source_exists}")
        self.stdout.write(f"Target path: {target_path}")
        self.stdout.write(f"  - Exists: {target_exists}")
        
        return {
            'source_exists': source_exists,
            'target_exists': target_exists,
            'source_path': source_path,
            'target_path': target_path
        }

    def check_directory_photos(self, gender):
        """Check all photos in a gender directory."""
        dir_path = f'calibration_photos/{gender.lower()}'
        source_dir = os.path.join(settings.BASE_DIR, 'static', dir_path)
        target_dir = os.path.join(settings.STATIC_ROOT, dir_path)
        
        self.stdout.write(f"\nChecking {gender} photos directory:")
        self.stdout.write(f"Source directory: {source_dir}")
        self.stdout.write(f"Target directory: {target_dir}")
        
        if not os.path.exists(source_dir):
            self.stdout.write(self.style.ERROR(f"Source directory does not exist!"))
            return
        
        if not os.path.exists(target_dir):
            self.stdout.write(self.style.ERROR(f"Target directory does not exist!"))
            return
        
        source_files = set(f for f in os.listdir(source_dir) if f.endswith('.jpg'))
        target_files = set(f for f in os.listdir(target_dir) if f.endswith('.jpg'))
        
        self.stdout.write(f"\nSource files count: {len(source_files)}")
        self.stdout.write(f"Target files count: {len(target_files)}")
        
        # Check for mismatches
        missing_in_target = source_files - target_files
        missing_in_source = target_files - source_files
        
        if missing_in_target:
            self.stdout.write(self.style.WARNING("\nFiles missing in target directory:"))
            for f in sorted(missing_in_target)[:5]:
                self.stdout.write(f"- {f}")
            if len(missing_in_target) > 5:
                self.stdout.write(f"...and {len(missing_in_target) - 5} more")
                
        if missing_in_source:
            self.stdout.write(self.style.WARNING("\nFiles missing in source directory:"))
            for f in sorted(missing_in_source)[:5]:
                self.stdout.write(f"- {f}")
            if len(missing_in_source) > 5:
                self.stdout.write(f"...and {len(missing_in_source) - 5} more")

    def verify_database_photos(self):
        """Verify all photos referenced in the database."""
        self.stdout.write("\nVerifying database records:")
        
        # Get all photos from database
        male_photos = Photo.objects.filter(gender='M')
        female_photos = Photo.objects.filter(gender='F')
        
        self.stdout.write(f"\nMale photos in database: {male_photos.count()}")
        self.stdout.write(f"Female photos in database: {female_photos.count()}")
        
        def check_photos(photos, gender):
            missing_files = []
            for photo in photos:
                expected_path = f'calibration_photos/{gender.lower()}/{photo.id:06d}.jpg'
                result = self.verify_photo_exists(expected_path)
                
                if not (result['source_exists'] and result['target_exists']):
                    missing_files.append({
                        'id': photo.id,
                        'path': expected_path,
                        'result': result
                    })
            
            if missing_files:
                self.stdout.write(self.style.WARNING(f"\nMissing {gender} photos:"))
                for mf in missing_files[:5]:
                    self.stdout.write(f"ID: {mf['id']}, Path: {mf['path']}")
                    self.stdout.write(f"  Source ({mf['result']['source_exists']}): {mf['result']['source_path']}")
                    self.stdout.write(f"  Target ({mf['result']['target_exists']}): {mf['result']['target_path']}")
                if len(missing_files) > 5:
                    self.stdout.write(f"...and {len(missing_files) - 5} more")
            else:
                self.stdout.write(self.style.SUCCESS(f"\nAll {gender} photos from database exist in both directories"))
        
        check_photos(male_photos, 'male')
        check_photos(female_photos, 'female')

    def verify_api_access(self):
        """Verify API access to photos."""
        self.stdout.write("\nVerifying API access:")
        
        # Create test user and get token if needed
        test_email = 'test3@example.com'
        
        try:
            user = User.objects.get(email=test_email)
        except User.DoesNotExist:
            user = User.objects.create_user(
                email=test_email,
                password='testpassword123',
                first_name='Test',
                last_name='User',
                is_active=True
            )
            UserPreference.objects.create(user=user, preferred_gender='M')
        
        # Get token
        response = requests.post(
            'http://localhost:8000/api/auth/login/',
            json={'email': test_email, 'password': 'testpassword123'}
        )
        
        if response.status_code != 200:
            self.stdout.write(self.style.ERROR(f"Failed to get auth token: {response.text}"))
            return
        
        token = response.json()['tokens']['access']
        
        # Test calibration photos endpoint for each gender
        for gender in ['M', 'F']:
            # Update user preference
            UserPreference.objects.filter(user=user).update(preferred_gender=gender)
            
            self.stdout.write(f"\nTesting API with preferred_gender={gender}")
            
            # Get photos from API
            response = requests.get(
                'http://localhost:8000/api/photos/calibration/',
                headers={'Authorization': f'Bearer {token}'}
            )
            
            if response.status_code != 200:
                self.stdout.write(self.style.ERROR(f"Failed to get calibration photos: {response.text}"))
                continue
            
            photos = response.json().get('photos', [])
            self.stdout.write(f"Received {len(photos)} photos from API")
            
            # Verify each photo URL
            invalid_photos = []
            for photo in photos:
                photo_url = f"http://localhost:8000{photo['image_url']}"
                photo_id = photo.get('id')
                response = requests.head(photo_url)
                
                self.stdout.write(f"\nChecking photo ID {photo_id}")
                self.stdout.write(f"URL: {photo_url}")
                self.stdout.write(f"Status: {response.status_code}")
                
                # Verify the photo exists in our directories
                photo_filename = f"{photo_id:06d}.jpg"
                gender_dir = 'male' if gender == 'M' else 'female'
                expected_path = f'calibration_photos/{gender_dir}/{photo_filename}'
                existence = self.verify_photo_exists(expected_path)
                
                if response.status_code != 200 or not existence['source_exists'] or not existence['target_exists']:
                    invalid_photos.append({
                        'id': photo_id,
                        'url': photo_url,
                        'status': response.status_code,
                        'exists_in_source': existence['source_exists'],
                        'exists_in_target': existence['target_exists']
                    })
            
            if invalid_photos:
                self.stdout.write(self.style.ERROR(f"\nFound {len(invalid_photos)} invalid photos for gender {gender}:"))
                for invalid in invalid_photos:
                    self.stdout.write(f"Photo ID: {invalid['id']}")
                    self.stdout.write(f"  URL: {invalid['url']}")
                    self.stdout.write(f"  HTTP Status: {invalid['status']}")
                    self.stdout.write(f"  Exists in source: {invalid['exists_in_source']}")
                    self.stdout.write(f"  Exists in target: {invalid['exists_in_target']}")
            else:
                self.stdout.write(self.style.SUCCESS(f"\nAll {len(photos)} photos for gender {gender} are valid and accessible"))

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting comprehensive photo verification..."))
        
        # Check directory structure
        self.check_directory_photos('male')
        self.check_directory_photos('female')
        
        # Verify database records
        self.verify_database_photos()
        
        # Verify API access
        self.verify_api_access() 