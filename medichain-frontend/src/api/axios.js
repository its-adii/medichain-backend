import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

const cache = new Map();
const CACHE_TTL = 5000; // 5 seconds

// Attach the access token to every request & check cache for GETs
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = config.method?.toLowerCase();
  
  // Cache GET requests
  if (method === "get" && config.cache !== false && config.headers?.["Cache-Control"] !== "no-cache") {
    const cacheKey = config.url + JSON.stringify(config.params || {});
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      config.adapter = () => {
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        });
      };
    }
  }

  // Invalidate cache on mutations (POST, PUT, DELETE, PATCH)
  if (["post", "put", "delete", "patch"].includes(method || "")) {
    cache.clear();
  }

  return config;
});

// On 401, attempt a token refresh and retry the original request once
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => {
    const config = response.config;
    const method = config.method?.toLowerCase();
    if (method === "get" && config.cache !== false && config.headers?.["Cache-Control"] !== "no-cache") {
      const cacheKey = config.url + JSON.stringify(config.params || {});
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes("/auth/login") ||
                        originalRequest?.url?.includes("/auth/register") ||
                        originalRequest?.url?.includes("/auth/refresh-token") ||
                        originalRequest?.url?.includes("/auth/logout");

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshTokenUrl = api.defaults.baseURL 
          ? `${api.defaults.baseURL}/auth/refresh-token`
          : "http://localhost:3000/api/auth/refresh-token";
        const res = await axios.post(
          refreshTokenUrl,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
