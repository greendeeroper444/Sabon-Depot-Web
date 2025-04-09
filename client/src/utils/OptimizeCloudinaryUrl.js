//new utility function to optimize Cloudinary URLs
export const optimizeCloudinaryUrl = (url, width = 300, height = 300) => {
    if (!url || !url.includes('cloudinary.com')) {
        return url; // Return original URL if not a Cloudinary URL
    }
    
    //extract base URL and transformation string
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    
    //add transformations for optimization
    return `${parts[0]}/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${parts[1]}`;
};