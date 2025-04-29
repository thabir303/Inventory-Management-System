import api from './api';

export const setAuthToken = (token: string): void => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const removeAuthToken = (): void => {
  delete api.defaults.headers.common['Authorization'];
};