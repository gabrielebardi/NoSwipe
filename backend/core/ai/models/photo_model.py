import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetV2B0
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.efficientnet_v2 import preprocess_input

class PhotoModel:
    def __init__(self):
        """Initialize the photo model with EfficientNetV2B0."""
        self.model = EfficientNetV2B0(
            weights='imagenet',
            include_top=False,
            pooling='avg'
        )
        
    def extract_features(self, img_path):
        """Extract features from an image using EfficientNetV2.
        
        Args:
            img_path (str): Path to the image file
            
        Returns:
            np.array: Feature vector of shape (1280,) or None if error
        """
        try:
            # Load and preprocess image
            img = image.load_img(img_path, target_size=(224, 224))
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            x = preprocess_input(x)
            
            # Extract features
            features = self.model.predict(x, verbose=0)
            return features.flatten()
            
        except Exception as e:
            print(f"Error extracting features from {img_path}: {e}")
            return None
            
    def batch_extract_features(self, img_paths):
        """Extract features from multiple images in batch.
        
        Args:
            img_paths (list): List of image file paths
            
        Returns:
            np.array: Feature matrix of shape (n_images, 1280)
        """
        features_list = []
        valid_paths = []
        
        for img_path in img_paths:
            features = self.extract_features(img_path)
            if features is not None:
                features_list.append(features)
                valid_paths.append(img_path)
                
        if not features_list:
            return None, []
            
        return np.vstack(features_list), valid_paths