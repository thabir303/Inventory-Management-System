// client/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';
import { removeAuthToken, setAuthToken } from '../utils/authToken';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  bio: string | null;
  date_joined: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface RegisterData {
  email: string;
  username?: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access: string;
    refresh: string;
    user: User;
  };
}

interface TokenRefreshResponse {
  success: boolean;
  message: string;
  data: {
    access: string;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        setAuthToken(token);
        try {
          const response = await api.get('/user/profile/');
          if (response.data.success) {
            setUser(response.data.data);
            setIsAuthenticated(true);
          } else {
            // Try to refresh the token
            const refreshed = await refreshToken();
            if (!refreshed) {
              logout();
            }
          }
        } catch (error) {
          const refreshed = await refreshToken();
          if (!refreshed) {
            logout();
          }
        }
      }
      
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const refreshToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return false;
    }
    
    try {
      const response = await api.post<TokenRefreshResponse>('/user/auth/token/refresh/', {
        refresh: refreshToken
      });
      
      if (response.data.success) {
        const accessToken = response.data.data.access;
        localStorage.setItem('accessToken', accessToken);
        setAuthToken(accessToken);
        const profileResponse = await api.get('/user/profile/');
        if (profileResponse.data.success) {
          setUser(profileResponse.data.data);
          setIsAuthenticated(true);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    
    try {
      const response = await api.post<LoginResponse>('/user/auth/login/', {
        email,
        password
      });
      
      if (response.data.success) {
        const { access, refresh, user } = response.data.data;
        
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        
        setAuthToken(access);
        setUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Login failed');
      }
      throw new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setLoading(true);
    
    try {
      const response = await api.post<LoginResponse>('/user/auth/register/', userData);
      
      if (response.data.success) {
        const { access, refresh, user } = response.data.data;
        
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        
        setAuthToken(access);
        setUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Registration failed');
      }
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    removeAuthToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await api.put('/user/profile/', userData);
      
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to update profile');
      }
      throw new Error('Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
        refreshToken,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};