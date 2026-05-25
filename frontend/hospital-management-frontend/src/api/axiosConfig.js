import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/hospital",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Bypass-Tunnel-Reminder": "true",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      // ← Only redirect if it's NOT the login endpoint
      // A 401 on /api/login means wrong password — let LoginPage handle it
      if (!requestUrl.includes('/api/login')) {
        console.error("Session expired. Redirecting to login.");
        window.location.href = "/HealthCare/login";
      }
    }
    return Promise.reject(error); // always reject so components can catch it
  }
);

export default axiosInstance;