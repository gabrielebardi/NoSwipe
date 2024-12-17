const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getImageUrl = (path: string) => {
    // If the path is already a full URL, return it as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    
    // Otherwise, prepend the API URL
    return `${API_URL}${path}`;
}; 