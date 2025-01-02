const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getImageUrl = (path: string | null) => {
    // If path is null or empty, return a default image
    if (!path) {
        return '/images/placeholder.jpg';
    }
    
    // If the path is already a full URL, return it as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    
    // If the path starts with /media/ or /static/, prepend the API URL
    if (path.startsWith('/media/') || path.startsWith('/static/')) {
        return `${API_URL}${path}`;
    }
    
    // For calibration photos, they should be in static files
    if (path.includes('calibration_photos/')) {
        return `${API_URL}/static/${path}`;
    }
    
    // For other paths, assume they're media files
    return `${API_URL}/media/${path}`;
}; 