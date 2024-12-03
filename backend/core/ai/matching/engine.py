import numpy as np
from datetime import datetime, timedelta
from ..models.composite_model import CompositeModel

class MatchingEngine:
    def __init__(self):
        """Initialize the matching engine."""
        self.model = CompositeModel()
        self.batch_config = {
            'free_user': {
                'batches_per_week': 7,
                'prospects_per_batch': 3,
                'min_compatibility': 0.8,
                'compatibility_decay': 0.05
            },
            'premium_user': {
                'batches_per_week': 50,
                'prospects_per_batch': 5,
                'min_compatibility': 0.8,
                'compatibility_decay': 0.03
            }
        }
        
    def filter_candidates(self, user, candidates, active_days=7):
        """Filter candidates based on basic criteria.
        
        Args:
            user: User object with preferences
            candidates: List of candidate users
            active_days: Number of days to consider a user active
            
        Returns:
            list: Filtered list of candidates
        """
        active_threshold = datetime.now() - timedelta(days=active_days)
        
        return [
            c for c in candidates
            if (c.last_active >= active_threshold and
                c.age >= user.min_age_preference and
                c.age <= user.max_age_preference and
                c.gender == user.gender_preference and
                c.location == user.location_preference)
        ]
        
    def generate_matches(self, user, candidates, batch_size=None):
        """Generate matches for a user.
        
        Args:
            user: User object
            candidates: List of pre-filtered candidates
            batch_size: Optional override for batch size
            
        Returns:
            list: List of (candidate, score) tuples
        """
        if not candidates:
            return []
            
        # Get user configuration
        user_type = 'premium_user' if user.is_premium else 'free_user'
        config = self.batch_config[user_type]
        
        if batch_size is None:
            batch_size = config['prospects_per_batch']
            
        # Calculate compatibility scores
        scores = []
        for candidate in candidates:
            # Skip if in cooldown period
            if self._is_in_cooldown(user, candidate):
                continue
                
            score = self.model.calculate_mutual_compatibility(
                user.photos, user.interests,
                candidate.photos, candidate.interests
            )
            scores.append((candidate, score))
            
        # Sort by score
        scores.sort(key=lambda x: x[1], reverse=True)
        
        # Apply adaptive threshold
        min_score = config['min_compatibility']
        while len([s for s in scores if s[1] >= min_score]) < batch_size:
            min_score -= config['compatibility_decay']
            if min_score < 0.5:  # Hard lower limit
                break
                
        # Filter and return top matches
        valid_matches = [(c, s) for c, s in scores if s >= min_score]
        return valid_matches[:batch_size]
        
    def _is_in_cooldown(self, user1, user2, cooldown_days=14):
        """Check if a pair of users is in cooldown period after rejection.
        
        Args:
            user1, user2: User objects
            cooldown_days: Number of days for cooldown
            
        Returns:
            bool: True if in cooldown period
        """
        # This should check the rejection history in the database
        # Placeholder implementation
        return False  # TODO: Implement actual cooldown check
        
    def generate_weekly_batches(self, user, candidates):
        """Generate all batches for a week.
        
        Args:
            user: User object
            candidates: List of candidates
            
        Returns:
            list: List of batches, each containing (candidate, score) tuples
        """
        user_type = 'premium_user' if user.is_premium else 'free_user'
        config = self.batch_config[user_type]
        
        filtered_candidates = self.filter_candidates(user, candidates)
        
        batches = []
        remaining_candidates = filtered_candidates.copy()
        
        for _ in range(config['batches_per_week']):
            if not remaining_candidates:
                break
                
            batch = self.generate_matches(
                user,
                remaining_candidates,
                config['prospects_per_batch']
            )
            
            if not batch:
                break
                
            batches.append(batch)
            # Remove matched candidates from remaining pool
            matched_candidates = [match[0] for match in batch]
            remaining_candidates = [
                c for c in remaining_candidates
                if c not in matched_candidates
            ]
            
        return batches 