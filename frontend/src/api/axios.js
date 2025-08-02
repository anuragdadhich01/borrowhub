// frontend/src/api/axios.js
import axios from 'axios';

// Emergency fallback configuration for AWS outages
const EMERGENCY_FALLBACK_URL = 'http://localhost:8080';
const AWS_PRIMARY_URL = 'https://psflzclkbl.execute-api.us-east-1.amazonaws.com/Prod';

// Determine the best API base URL with emergency fallback
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // In development, always use localhost
  if (import.meta.env.DEV) {
    return envUrl || EMERGENCY_FALLBACK_URL;
  }
  
  // In production, prefer environment variable, then AWS, then emergency fallback
  return envUrl || AWS_PRIMARY_URL;
};

// Enhanced axios instance with better error handling and retry logic
const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Emergency fallback state
let isUsingFallback = false;
let fallbackInstance = null;

// Create emergency fallback instance
const createFallbackInstance = () => {
  if (!fallbackInstance) {
    fallbackInstance = axios.create({
      baseURL: EMERGENCY_FALLBACK_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add auth interceptor to fallback instance
    fallbackInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  return fallbackInstance;
};

// Helper function to check if error is retryable
const isRetryableError = (error) => {
  // Network errors, timeouts, and 5xx server errors are retryable
  return !error.response || 
         error.code === 'NETWORK_ERROR' ||
         error.code === 'ECONNABORTED' ||
         error.code === 'ERR_NETWORK' ||
         error.code === 'ERR_NAME_NOT_RESOLVED' ||
         (error.response && error.response.status >= 500);
};

// Helper function to check if we should try emergency fallback
const shouldTryEmergencyFallback = (error) => {
  return error.code === 'ERR_NAME_NOT_RESOLVED' || 
         error.code === 'ERR_NETWORK' ||
         error.code === 'NETWORK_ERROR' ||
         !error.response;
};

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Request interceptor to add auth token and retry logic
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Initialize retry count
    config.retryCount = config.retryCount || 0;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with retry logic and emergency fallback
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      // Redirect to login could be handled here
    }
    
    // Try emergency fallback for network errors (only if not already using fallback)
    if (!isUsingFallback && shouldTryEmergencyFallback(error)) {
      console.log('Primary endpoint failed, trying emergency fallback to localhost...');
      
      try {
        const fallback = createFallbackInstance();
        isUsingFallback = true;
        
        // Retry the same request with fallback instance
        const fallbackConfig = {
          ...config,
          baseURL: EMERGENCY_FALLBACK_URL,
          retryCount: 0 // Reset retry count for fallback
        };
        
        const response = await fallback(fallbackConfig);
        
        console.log('Emergency fallback successful! Using localhost backend.');
        
        // Update the main instance to use fallback for future requests
        axiosInstance.defaults.baseURL = EMERGENCY_FALLBACK_URL;
        
        return response;
        
      } catch (fallbackError) {
        console.log('Emergency fallback also failed:', fallbackError.message);
        // Continue with normal retry logic
        isUsingFallback = false;
      }
    }
    
    // Retry logic for network and server errors
    if (config && isRetryableError(error) && config.retryCount < MAX_RETRIES) {
      config.retryCount++;
      
      // Calculate delay with exponential backoff
      const retryDelay = RETRY_DELAY * Math.pow(2, config.retryCount - 1);
      
      console.log(`Retrying request (attempt ${config.retryCount}/${MAX_RETRIES}) after ${retryDelay}ms delay...`);
      
      await delay(retryDelay);
      
      return axiosInstance(config);
    }
    
    // Enhance error object with user-friendly message
    if (!error.response) {
      // Network error
      error.userMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      error.isNetworkError = true;
    } else if (error.response.status >= 500) {
      // Server error
      error.userMessage = 'Server is temporarily unavailable. Please try again in a few moments.';
      error.isServerError = true;
    } else if (error.response.status === 404) {
      // Not found
      error.userMessage = 'The requested resource was not found.';
    } else if (error.response.status === 401) {
      // Unauthorized
      error.userMessage = 'Please log in to continue.';
    } else if (error.response.status === 403) {
      // Forbidden
      error.userMessage = 'You do not have permission to access this resource.';
    } else {
      // Other errors
      error.userMessage = error.response.data?.error || 'An unexpected error occurred. Please try again.';
    }
    
    return Promise.reject(error);
  }
);

// Network status detection with emergency fallback
export const checkNetworkStatus = async () => {
  try {
    await axiosInstance.get('/health', { timeout: 5000 });
    return { online: true, apiAvailable: true, usingFallback: isUsingFallback };
  } catch (error) {
    if (!error.response) {
      // Try emergency fallback if not already using it
      if (!isUsingFallback) {
        try {
          const fallback = createFallbackInstance();
          await fallback.get('/health', { timeout: 3000 });
          
          console.log('Switched to emergency fallback backend');
          isUsingFallback = true;
          axiosInstance.defaults.baseURL = EMERGENCY_FALLBACK_URL;
          
          return { online: true, apiAvailable: true, usingFallback: true };
        } catch (fallbackError) {
          console.log('Both primary and fallback backends unavailable');
        }
      }
      
      // Check if we can reach any external service
      try {
        await fetch('https://httpbin.org/get', { 
          method: 'GET', 
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });
        return { online: true, apiAvailable: false, usingFallback: isUsingFallback };
      } catch {
        return { online: false, apiAvailable: false, usingFallback: isUsingFallback };
      }
    }
    return { online: true, apiAvailable: false, usingFallback: isUsingFallback };
  }
};

// Export function to manually switch to localhost fallback
export const switchToLocalhost = () => {
  console.log('Manually switching to localhost backend...');
  isUsingFallback = true;
  axiosInstance.defaults.baseURL = EMERGENCY_FALLBACK_URL;
  createFallbackInstance(); // Ensure fallback instance exists
  return true;
};

// Export function to get current status
export const getApiStatus = () => ({
  baseURL: axiosInstance.defaults.baseURL,
  usingFallback: isUsingFallback,
  fallbackURL: EMERGENCY_FALLBACK_URL
});

export default axiosInstance;