import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from .photo_model import PhotoModel
from .interest_model import InterestModel

class CompositeModel:
    def __init__(self):
        """Initialize composite model components."""
        self.photo_model = PhotoModel()
        self.interest_model = InterestModel()
        self.preference_model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=3,
            random_state=42
        )
        self.is_fitted = False
        
    def fit(self, photo_paths, interest_ratings, target_ratings, sample_weights=None):
        """Fit the composite model using both photo and interest data.
        
        Args:
            photo_paths (list): List of paths to user photos
            interest_ratings (np.array): User interest ratings
            target_ratings (np.array): Target preference ratings
            sample_weights (np.array, optional): Weights for training samples
        """
        # Extract photo features
        photo_features, valid_paths = self.photo_model.batch_extract_features(photo_paths)
        if photo_features is None:
            raise ValueError("No valid photo features extracted")
            
        # Process interest ratings
        self.interest_model.fit(interest_ratings)
        interest_features = self.interest_model.transform(interest_ratings)
        
        # Combine features
        combined_features = np.hstack([photo_features, interest_features])
        
        # Train preference model
        self.preference_model.fit(
            combined_features,
            target_ratings,
            sample_weight=sample_weights
        )
        self.is_fitted = True
        
    def predict(self, photo_paths, interest_ratings):
        """Predict preference scores for new users.
        
        Args:
            photo_paths (list): List of paths to user photos
            interest_ratings (np.array): User interest ratings
            
        Returns:
            np.array: Predicted preference scores
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
            
        # Extract photo features
        photo_features, valid_paths = self.photo_model.batch_extract_features(photo_paths)
        if photo_features is None:
            raise ValueError("No valid photo features extracted")
            
        # Process interest ratings
        interest_features = self.interest_model.transform(interest_ratings)
        
        # Combine features
        combined_features = np.hstack([photo_features, interest_features])
        
        # Predict preferences
        return self.preference_model.predict(combined_features)
        
    def calculate_mutual_compatibility(self, user1_photos, user1_interests,
                                    user2_photos, user2_interests):
        """Calculate mutual compatibility between two users.
        
        Args:
            user1_photos (list): First user's photo paths
            user1_interests (np.array): First user's interest ratings
            user2_photos (list): Second user's photo paths
            user2_interests (np.array): Second user's interest ratings
            
        Returns:
            float: Mutual compatibility score between 0 and 1
        """
        # Get preference predictions in both directions
        pref1_to_2 = self.predict([user2_photos[0]], user2_interests)[0]  # User1's preference for User2
        pref2_to_1 = self.predict([user1_photos[0]], user1_interests)[0]  # User2's preference for User1
        
        # Calculate interest similarity
        interest_similarity = self.interest_model.calculate_similarity(
            user1_interests,
            user2_interests
        )
        
        # Combine scores with weights
        photo_weight = 0.7  # Higher weight for photo-based preferences
        interest_weight = 0.3  # Lower weight for interest similarity
        
        mutual_score = (
            photo_weight * (pref1_to_2 + pref2_to_1) / 2 +
            interest_weight * interest_similarity
        )
        
        return mutual_score 