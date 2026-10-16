import axios from 'axios';

const API_BASE_URL = 'https://route-posts.routemisr.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('route_social_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.token = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, can clear token if not on login/signup
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup')
      ) {
        // Optional auto-logout on token expiration
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
