import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an expired token and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            'http://localhost:8000/api/user/auth/token/refresh/',
            { refresh: refreshToken }
          );
          
          if (response.data.success) {
            const accessToken = response.data.data.access;
            localStorage.setItem('accessToken', accessToken);
            
            // Update the authorization header
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            
            // Retry the original request
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        // Token refresh failed, logout user or handle appropriately
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;