import numpy as np
from collections import deque
from datetime import datetime, timedelta

class FeedbackProcessor:
    def __init__(self, window_size=100):
        """Initialize the feedback processor.
        
        Args:
            window_size (int): Size of the sliding window for feedback
        """
        self.window_size = window_size
        self.feedback_weights = {
            'explicit': {
                'thumbs_up': 1.0,
                'thumbs_down': -1.0
            },
            'implicit': {
                'profile_view': 0.2,
                'chat_initiated': 0.5,
                'chat_received_response': 0.8,
                'extended_chat': 1.0
            }
        }
        self.feedback_windows = {}  # User ID -> deque of feedback
        
    def process_explicit_feedback(self, user_id, target_id, feedback_type):
        """Process explicit feedback (thumbs up/down).
        
        Args:
            user_id: ID of the user giving feedback
            target_id: ID of the user receiving feedback
            feedback_type: 'thumbs_up' or 'thumbs_down'
            
        Returns:
            float: Feedback score
        """
        score = self.feedback_weights['explicit'][feedback_type]
        self._add_to_window(user_id, target_id, score)
        return score
        
    def process_implicit_feedback(self, user_id, target_id, interaction_type):
        """Process implicit feedback from user interactions.
        
        Args:
            user_id: ID of the user
            target_id: ID of the target user
            interaction_type: Type of interaction
            
        Returns:
            float: Feedback score
        """
        score = self.feedback_weights['implicit'][interaction_type]
        self._add_to_window(user_id, target_id, score)
        return score
        
    def _add_to_window(self, user_id, target_id, score):
        """Add feedback to the user's sliding window.
        
        Args:
            user_id: ID of the user
            target_id: ID of the target user
            score: Feedback score
        """
        if user_id not in self.feedback_windows:
            self.feedback_windows[user_id] = deque(maxlen=self.window_size)
            
        self.feedback_windows[user_id].append({
            'target_id': target_id,
            'score': score,
            'timestamp': datetime.now()
        })
        
    def get_training_weights(self, user_id, target_ids):
        """Get training weights for a set of target users.
        
        Args:
            user_id: ID of the user
            target_ids: List of target user IDs
            
        Returns:
            dict: Dictionary mapping target_id to weight
        """
        weights = {}
        if user_id not in self.feedback_windows:
            return {tid: 1.0 for tid in target_ids}
            
        # Calculate weights based on feedback history
        for feedback in self.feedback_windows[user_id]:
            target_id = feedback['target_id']
            if target_id in target_ids:
                if target_id not in weights:
                    weights[target_id] = 0
                # More recent feedback has more influence
                age = (datetime.now() - feedback['timestamp']).days
                time_weight = max(0.5, 1.0 - (age / 30))  # Decay over 30 days
                weights[target_id] += feedback['score'] * time_weight
                
        # Normalize weights
        if weights:
            min_weight = min(weights.values())
            max_weight = max(weights.values())
            if min_weight != max_weight:
                for tid in weights:
                    weights[tid] = (weights[tid] - min_weight) / (max_weight - min_weight)
                    weights[tid] = max(0.1, weights[tid])  # Ensure minimum weight of 0.1
            
        # Add default weight for users without feedback
        for tid in target_ids:
            if tid not in weights:
                weights[tid] = 1.0
                
        return weights
        
    def should_retrain(self, user_id, feedback_threshold=10):
        """Check if model should be retrained based on feedback volume.
        
        Args:
            user_id: ID of the user
            feedback_threshold: Minimum number of feedback items to trigger retraining
            
        Returns:
            bool: True if retraining is recommended
        """
        if user_id not in self.feedback_windows:
            return False
            
        recent_feedback = [
            f for f in self.feedback_windows[user_id]
            if (datetime.now() - f['timestamp']) <= timedelta(days=7)
        ]
        
        return len(recent_feedback) >= feedback_threshold 