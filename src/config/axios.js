import axios from 'axios';

/**
 * API base URL
 *
 * .env.development
 * VITE_API_URL=/api
 *
 * .env.production
 * VITE_API_URL=https://al-naaz.onrender.com/api
 */
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_URL is not defined. Check your environment configuration.'
  );
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Prevent multiple simultaneous logout calls.
 */
let isLoggingOut = false;

/**
 * Public/auth endpoints where a 401 should NOT automatically
 * trigger application logout.
 *
 * Matched against the request's pathname (not a raw substring of the
 * full URL) to avoid false positives like `/users/login/legacy`.
 */
const PUBLIC_ENDPOINTS = [
  '/users/login/',
  '/users/register/',
  '/users/forgot-password/',
  '/users/reset-password/',
];

/**
 * Check whether the failed request belongs to a public endpoint.
 * Compares against the pathname only, so query strings/hosts can't
 * cause accidental matches.
 */
const isPublicEndpoint = (url = '') => {
  let pathname = url;
  try {
    // Handles both relative ('/api/users/login/') and absolute URLs.
    pathname = new URL(url, API_BASE_URL).pathname;
  } catch {
    // If url isn't parseable, fall back to raw string.
  }
  return PUBLIC_ENDPOINTS.some((endpoint) => pathname.includes(endpoint));
};

/**
 * Dev-only logger. Nothing is sent to the console in production;
 * wire this into a monitoring service (Sentry, LogRocket, etc.)
 * for real production error visibility.
 */
const devLog = (...args) => {
  if (import.meta.env.DEV) {
    console.error(...args);
  }
};

/**
 * Response interceptor
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Canceled requests (AbortController / axios.CancelToken) aren't
    // real errors — let callers handle them without a generic message.
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const { response, request, config } = error;

    // Network error / server unreachable
    if (!response) {
      if (request) {
        devLog('[API Network Error]', {
          url: config?.url,
          method: config?.method,
          message: error.message,
        });
        error.userMessage =
          'Unable to connect to the server. Please check your internet connection.';
      } else {
        devLog('[API Request Setup Error]', error);
        error.userMessage =
          'Unable to process your request. Please try again.';
      }
      return Promise.reject(error);
    }

    const status = response.status;
    const data = response.data;
    const serverMessage = data?.message || data?.error || data?.detail;

    switch (status) {
      case 400:
        error.userMessage =
          serverMessage || 'Invalid request. Please check your input.';
        break;

      case 401:
        error.userMessage =
          serverMessage || 'Your session has expired. Please log in again.';

        // Don't logout when login itself (or another public endpoint) returns 401
        if (!isPublicEndpoint(config?.url) && !isLoggingOut) {
          isLoggingOut = true;
          try {
            // Dynamic import breaks the authStore <-> axiosInstance
            // circular dependency at the module-graph level.
            const { useAuthStore } = await import('../store/authStore');
            await useAuthStore.getState().logout();
          } catch (logoutErr) {
            devLog('[Logout Error]', logoutErr);
          } finally {
            isLoggingOut = false;
          }
        }
        break;

      case 403:
        error.userMessage =
          serverMessage ||
          'You do not have permission to perform this action.';
        break;

      case 404:
        error.userMessage =
          serverMessage || 'The requested resource was not found.';
        break;

      case 409:
        error.userMessage =
          serverMessage || 'This operation conflicts with existing data.';
        break;

      case 422:
        error.userMessage =
          serverMessage || 'The submitted data could not be processed.';
        break;

      case 429:
        error.userMessage =
          serverMessage || 'Too many requests. Please try again later.';
        break;

      default:
        if (status >= 500) {
          error.userMessage = 'A server error occurred. Please try again later.';
        } else {
          error.userMessage =
            serverMessage || 'An unexpected error occurred. Please try again.';
        }
    }

    // Dev-only diagnostic log. Route to a monitoring service in production.
    devLog('[API Error]', {
      status,
      method: config?.method?.toUpperCase(),
      url: config?.url,
      message: serverMessage || error.message,
    });

    // Keep the original Axios error
    return Promise.reject(error);
  }
);

export default axiosInstance;