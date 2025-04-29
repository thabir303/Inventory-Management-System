// src/pages/admin/UserDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

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

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get(`/user/users/${id}/`);
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          setError('Failed to fetch user details');
        }
      } catch (err) {
        setError('An error occurred while fetching user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await api.delete(`/user/users/${id}/`);
      if (response.data.success) {
        navigate('/admin/users');
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      setError('An error occurred while deleting the user');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner  />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error || 'User not found'}</h3>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Link to="/admin/users" className="text-indigo-600 hover:text-indigo-900">
            &larr; Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">User Details</h1>
          <p className="mt-2 text-sm text-gray-500">Viewing detailed information about {user.first_name} {user.last_name}</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/admin/users" className="btn btn-secondary">
            Back to Users
          </Link>
          <Link to={`/admin/users/${id}/edit`} className="btn btn-primary">
            Edit User
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">User personal details and account information.</p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
            user.role === 'admin' 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {user.role === 'admin' ? 'Administrator' : 'Regular User'}
          </span>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.first_name} {user.last_name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Username</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.username}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Bio</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.bio || <span className="text-gray-400 italic">No bio provided</span>}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Member since</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(user.date_joined)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Link to="/admin/users" className="text-indigo-600 hover:text-indigo-900">
          &larr; Back to Users
        </Link>
        <button
          onClick={handleDelete}
          className="btn btn-danger"
        >
          Delete User
        </button>
      </div>
    </div>
  );
};

export default UserDetails;