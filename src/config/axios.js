import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// For local dev, extract the path (e.g. '/api') from VITE_API_URL so it hits the Vite Proxy.
// In production, it uses the exact absolute URL from .env.
let devBaseUrl = '';
try {
  devBaseUrl = import.meta.env.VITE_API_URL ? new URL(import.meta.env.VITE_API_URL).pathname : '';
} catch (e) {
  devBaseUrl = import.meta.env.VITE_API_URL;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? devBaseUrl : import.meta.env.VITE_API_URL,
  timeout: 60000, // Increased to 60s for Render free tier spin-up
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  headers: {
    'Content-Type': 'application/json',
  },
});


// Response interceptor: Global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      // The server responded with a status code that falls out of the range of 2xx
      const status = error.response.status;
      const data = error.response.data;

      // Custom message from server if it exists (prioritize 'message' over 'error')
      const serverMessage = data?.message || data?.error;
      errorMessage = serverMessage || errorMessage;

      switch (status) {
        case 401:
          errorMessage = serverMessage || 'Session expired. Please log in again.';
          // Automatically trigger logout in auth store
          useAuthStore.getState().logout();
          break;
        case 403:
          errorMessage = serverMessage || 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = serverMessage || 'Requested resource not found.';
          break;
        case 500:
          errorMessage = serverMessage || 'Server error. Please contact support or try again later.';
          break;
        default:
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'Network error. Please check your internet connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message;
    }

    // Log the error details to console for debugging in production
    console.error('[API Error]:', error);

    // Return custom error format
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;
