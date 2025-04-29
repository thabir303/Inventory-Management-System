// src/pages/admin/AdminDashboard.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

interface AdminRegisterFormValues {
  email: string;
  username: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

const AdminRegisterSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  username: Yup.string().min(3, 'Username must be at least 3 characters'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  password2: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
});

const AdminDashboard = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const initialValues: AdminRegisterFormValues = {
    email: '',
    username: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  };

  const handleSubmit = async (values: AdminRegisterFormValues, { resetForm }: { resetForm: () => void }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/admin/register/', values);
      
      if (response.data.success) {
        setSuccess(true);
        resetForm();
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError('Failed to create admin user');
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors).flat().join(', '));
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 pb-5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">Admin Dashboard</h2>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Manage users and system settings.
            </p>
          </div>
          <div className="mt-3 flex md:ml-4">
            <Link
              to="/admin/users"
              className="btn btn-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              View All Users
            </Link>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Create Admin User</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Create a new administrator account with full access.</p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {success && (
                <div className="mb-4 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">Admin user created successfully!</p>
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}
              
              <Formik
                initialValues={initialValues}
                validationSchema={AdminRegisterSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <Field
                          id="first_name"
                          name="first_name"
                          type="text"
                          className="form-input mt-1"
                          disabled={isLoading}
                        />
                        <ErrorMessage name="first_name" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <Field
                          id="last_name"
                          name="last_name"
                          type="text"
                          className="form-input mt-1"
                          disabled={isLoading}
                        />
                        <ErrorMessage name="last_name" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        className="form-input mt-1"
                        disabled={isLoading}
                      />
                      <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username (optional)
                      </label>
                      <Field
                        id="username"
                        name="username"
                        type="text"
                        className="form-input mt-1"
                        disabled={isLoading}
                      />
                      <ErrorMessage name="username" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <Field
                          id="password"
                          name="password"
                          type="password"
                          className="form-input mt-1"
                          disabled={isLoading}
                        />
                        <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      <div>
                        <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
                          Confirm password
                        </label>
                        <Field
                          id="password2"
                          name="password2"
                          type="password"
                          className="form-input mt-1"
                          disabled={isLoading}
                        />
                        <ErrorMessage name="password2" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isSubmitting || isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <LoadingSpinner  />
                            <span className="ml-2">Creating admin...</span>
                          </span>
                        ) : (
                          'Create Admin User'
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
          
          <div className="card">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">System Statistics</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Key metrics and system information.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Total Users</dt>
                  <dd className="mt-1 text-sm text-gray-900">Loading...</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Administrators</dt>
                  <dd className="mt-1 text-sm text-gray-900">Loading...</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                  <dd className="mt-1 text-sm text-gray-900">Loading...</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">System Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Online
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;