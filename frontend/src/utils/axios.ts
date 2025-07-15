// utils/axios.ts

import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL as string;

interface RefreshTokenResponse {
  access: string;
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies for refresh token
});

// Request interceptor — attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — refresh token on 401
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      console.log("Access Token Expired");
      originalRequest._retry = true;

      try {
        const refreshRes = await axios.post<RefreshTokenResponse>(
          `${BASE_URL}/api/auth/token/refresh/`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data.access;
        localStorage.setItem('accessToken', newAccessToken);

        // Retry original request with new token
        originalRequest.headers?.set?.('Authorization', `Bearer ${newAccessToken}`);

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
