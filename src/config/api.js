// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://proyek-cashier-hub-backend.vercel.app";

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/login`,
  USERS: `${API_BASE_URL}/api/users`,
  USER_STATS: `${API_BASE_URL}/api/users/stats`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_STATS: `${API_BASE_URL}/api/products/stats`,
  TRANSACTIONS: `${API_BASE_URL}/api/transactions`,
};

export default API_BASE_URL;
