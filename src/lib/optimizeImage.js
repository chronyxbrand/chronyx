export const optimizeImage = (url, width = 800) => {
  if (!url) return '';

  // Cloudinary Optimization
  if (url.includes('res.cloudinary.com')) {
    // Check if it already has transformations
    if (url.includes('/upload/v')) {
      return url.replace('/upload/', `/upload/c_scale,w_${width},q_auto,f_auto/`);
    } else if (url.includes('/upload/')) {
      // It might already have some transformations like /upload/c_fill...
      // For safety, we just ensure it's returned if we can't cleanly parse it, 
      // but typically we can split and inject.
      const parts = url.split('/upload/');
      return `${parts[0]}/upload/c_scale,w_${width},q_auto,f_auto/${parts[1]}`;
    }
  }

  // Unsplash Optimization
  if (url.includes('images.unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    // Remove existing w= and q= if they exist to prevent duplication, though Unsplash handles overrides
    return `${url}${separator}w=${width}&q=80&auto=format`;
  }

  // Fallback for other URLs (e.g. local assets)
  return url;
};
