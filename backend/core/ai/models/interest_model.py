import numpy as np
from sklearn.preprocessing import StandardScaler
from scipy.spatial.distance import cosine

class InterestModel:
    def __init__(self):
        """Initialize the interest model."""
        self.scaler = StandardScaler()
        self.is_fitted = False
        
    def fit(self, interest_ratings):
        """Fit the scaler to interest ratings.
        
        Args:
            interest_ratings (np.array): Array of shape (n_samples, n_interests)
        """
        self.scaler.fit(interest_ratings)
        self.is_fitted = True
        
    def transform(self, interest_ratings):
        """Transform interest ratings to normalized form.
        
        Args:
            interest_ratings (np.array): Array of shape (n_samples, n_interests)
            
        Returns:
            np.array: Normalized interest ratings
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before transform")
        return self.scaler.transform(interest_ratings)
        
    def calculate_similarity(self, user_interests1, user_interests2):
        """Calculate cosine similarity between two users' interests.
        
        Args:
            user_interests1 (np.array): First user's interest ratings
            user_interests2 (np.array): Second user's interest ratings
            
        Returns:
            float: Similarity score between 0 and 1
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before calculating similarity")
            
        # Transform both interest vectors
        interests1_norm = self.transform(user_interests1.reshape(1, -1))
        interests2_norm = self.transform(user_interests2.reshape(1, -1))
        
        # Calculate cosine similarity
        similarity = 1 - cosine(interests1_norm.flatten(), interests2_norm.flatten())
        return max(0, similarity)  # Ensure non-negative similarity
        
    def batch_calculate_similarity(self, user_interests, other_users_interests):
        """Calculate similarities between one user and many others.
        
        Args:
            user_interests (np.array): Single user's interest ratings (1D array)
            other_users_interests (np.array): Matrix of other users' ratings
            
        Returns:
            np.array: Array of similarity scores
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before calculating similarity")
            
        # Transform all interest vectors
        user_interests_norm = self.transform(user_interests.reshape(1, -1))
        others_interests_norm = self.transform(other_users_interests)
        
        # Calculate similarities
        similarities = []
        for other_interests in others_interests_norm:
            similarity = 1 - cosine(user_interests_norm.flatten(), other_interests)
            similarities.append(max(0, similarity))
            
        return np.array(similarities) 