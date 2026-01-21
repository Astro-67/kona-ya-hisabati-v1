import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Use Vite environment variable (fallback to localhost for dev safety)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://157.230.31.122/api/';

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError;
    const data = ax.response?.data;
    // Safely extract message from response data
    const messageFromData =
      data && typeof data === 'object' && 'message' in data ? (data as any).message : undefined;

    return {
      message: messageFromData ?? ax.message ?? 'An error occurred',
      status: ax.response?.status,
      data,
    };
  }

  const err = error as Error;
  return { message: err.message || String(error) };
}

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch (err) {
    return null;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add Bearer token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (token && config.headers) {
      // Safer way to set headers in Axios v1+
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(toApiError(error))
);

// Response interceptor: handle 401 and map errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // If unauthorized, clear auth state and redirect to login
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
      } catch (e) {
        // ignore
      }
      
      // Force redirect to login if we aren't already there
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    return Promise.reject(toApiError(error));
  }
);

export default apiClient;