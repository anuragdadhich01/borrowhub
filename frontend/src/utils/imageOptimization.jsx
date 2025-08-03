import { useState, useEffect, useRef } from 'react';

// Progressive image loading hook with WebP support
export const useProgressiveImage = (src, placeholder = null) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const imageRef = useRef();

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setError(false);

    // Check if browser supports WebP
    const supportsWebP = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    // Convert image URL to WebP if supported
    const getOptimizedImageUrl = (originalUrl) => {
      if (!originalUrl || originalUrl.startsWith('data:') || originalUrl.includes('.svg')) {
        return originalUrl;
      }

      // If it's a placeholder image or external CDN, return as is
      if (originalUrl.includes('placehold.co') || 
          originalUrl.includes('picsum') || 
          originalUrl.includes('unsplash') ||
          originalUrl.includes('cloudinary') ||
          originalUrl.includes('amazonaws.com')) {
        return originalUrl;
      }

      // For local images, try to use WebP if supported
      if (supportsWebP() && !originalUrl.includes('.webp')) {
        const webpUrl = originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        return webpUrl;
      }

      return originalUrl;
    };

    const imageUrl = getOptimizedImageUrl(src);
    const img = new Image();

    img.onload = () => {
      setImageSrc(imageUrl);
      setIsLoading(false);
    };

    img.onerror = () => {
      // Fallback to original URL if WebP fails
      if (imageUrl !== src && imageUrl.includes('.webp')) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setImageSrc(src);
          setIsLoading(false);
        };
        fallbackImg.onerror = () => {
          setError(true);
          setIsLoading(false);
        };
        fallbackImg.src = src;
      } else {
        setError(true);
        setIsLoading(false);
      }
    };

    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder]);

  return { imageSrc, isLoading, error };
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref, isVisible];
};

// Optimized Image Component with lazy loading and WebP support
export const OptimizedImage = ({
  src,
  alt,
  placeholder = '/images/placeholder.svg',
  className = '',
  style = {},
  lazy = true,
  ...props
}) => {
  const [intersectionRef, isVisible] = useIntersectionObserver();
  const shouldLoad = !lazy || isVisible;
  const { imageSrc, isLoading, error } = useProgressiveImage(
    shouldLoad ? src : null,
    placeholder
  );

  // Generate placeholder with proper dimensions
  const generatePlaceholder = (width = 300, height = 200) => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial, sans-serif" font-size="14">
          Loading...
        </text>
      </svg>
    `)}`;
  };

  const imageStyles = {
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoading ? 0.7 : 1,
    ...style,
  };

  if (error) {
    return (
      <div
        ref={intersectionRef}
        className={`image-error ${className}`}
        style={{
          ...imageStyles,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#999',
          fontSize: '14px',
          minHeight: '200px',
        }}
        {...props}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <img
      ref={intersectionRef}
      src={imageSrc || generatePlaceholder()}
      alt={alt}
      className={className}
      style={imageStyles}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      {...props}
    />
  );
};

// Image preloader for critical images
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Batch image preloader
export const preloadImages = (urls) => {
  return Promise.allSettled(urls.map(preloadImage));
};

// Generate responsive image sizes
export const generateResponsiveImageUrl = (baseUrl, width = 400) => {
  // For placeholder services, add size parameters
  if (baseUrl.includes('placehold.co')) {
    return `${baseUrl}?w=${width}`;
  }
  
  if (baseUrl.includes('picsum.photos')) {
    return `${baseUrl}/${width}`;
  }
  
  // For Cloudinary or other CDNs, you could add transformation parameters
  if (baseUrl.includes('cloudinary.com')) {
    return baseUrl.replace('/upload/', `/upload/w_${width},c_scale,f_auto,q_auto/`);
  }
  
  return baseUrl;
};

// Image compression utility for uploads
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

// WebP support detection
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

// Responsive image srcSet generator
export const generateSrcSet = (baseUrl, sizes = [400, 600, 800, 1200]) => {
  return sizes
    .map(size => `${generateResponsiveImageUrl(baseUrl, size)} ${size}w`)
    .join(', ');
};

export default OptimizedImage;