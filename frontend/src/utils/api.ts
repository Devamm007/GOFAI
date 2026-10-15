/**
 * Base API URL resolver.
 * When VITE_API_URL is configured (e.g., pointing to Render/Railway), uses that domain.
 * When empty (default), uses relative '/api' paths for Vite proxy in local dev
 * and Vercel transparent rewrites in production.
 */
const RAW_API_URL = import.meta.env.VITE_API_URL || '';

export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

export const apiUrl = (endpoint: string): string => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};
