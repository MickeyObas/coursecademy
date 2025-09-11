// utils/axios.ts

import axios from 'axios';
import { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { triggerRateLimit } from './rateLimitManager';

const BASE_URL = import.meta.env.VITE_BACKEND_URL as string;

interface RefreshTokenResponse {
  access: string;
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies for refresh token
});

let isRateLimited = false;
let rateLimitTimer: number | null = null;

const startCooldown = (seconds: number) => {
  isRateLimited = true;

  if (rateLimitTimer) clearTimeout(rateLimitTimer);
  rateLimitTimer = window.setTimeout(() => {
    isRateLimited = false;
    rateLimitTimer = null;
  }, seconds * 1000)
}

// Request interceptor — attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (isRateLimited) {
    throw new AxiosError(
      "Client-side rate limit active",
      "ERR_CLIENT_RATE_LIMIT",
      config
    );
  }

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

    if (error.response?.status === 429) {
      console.log(error.response.data);
      const data = error.response?.data as { retry_after?: number } | undefined;
      const retryAfter = data?.retry_after || error.response.headers['retry-after'];
      const seconds = Number(retryAfter) || 30;
      console.log(seconds);
      startCooldown(seconds);
      triggerRateLimit(seconds);
    }

    return Promise.reject(error);
  }
);

export default api;
