// frontend/src/api/axios.js
import axios from 'axios';

// Enhanced axios instance with better error handling and retry logic
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://psflzclkbl.execute-api.us-east-1.amazonaws.com/Prod',
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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

// Enhanced response interceptor with retry logic and better error handling
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

// Network status detection
export const checkNetworkStatus = async () => {
  try {
    await axiosInstance.get('/health', { timeout: 5000 });
    return { online: true, apiAvailable: true };
  } catch (error) {
    if (!error.response) {
      // Network error - check if we can reach any external service
      try {
        await fetch('https://httpbin.org/get', { 
          method: 'GET', 
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });
        return { online: true, apiAvailable: false };
      } catch {
        return { online: false, apiAvailable: false };
      }
    }
    return { online: true, apiAvailable: false };
  }
};

export default axiosInstance;