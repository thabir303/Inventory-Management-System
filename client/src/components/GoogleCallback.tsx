import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const GoogleCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshToken } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      
      if (!code) {
        setError('Authentication failed: No code parameter found');
        return;
      }
      
      try {
        // Assuming the Django backend will handle the token exchange
        // and set the cookies or local storage
        await refreshToken();
        navigate('/dashboard');
      } catch (err) {
        setError('Authentication failed. Please try again.');
      }
    };
    
    processCallback();
  }, [location, navigate, refreshToken]);

  if (error) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg 
            className="h-6 w-6 text-red-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900">Authentication Failed</h3>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <LoadingSpinner/>
      <p className="mt-4 text-sm text-gray-600">Processing your Google login...</p>
    </div>
  );
};

export default GoogleCallback;