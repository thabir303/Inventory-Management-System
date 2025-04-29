// src/pages/auth/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialValues: LoginFormValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
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
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="form-input"
                      disabled={isLoading}
                    />
                    <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      className="form-input"
                      disabled={isLoading}
                    />
                    <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="btn btn-primary w-full"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <LoadingSpinner  />
                        <span className="ml-2">Signing in...</span>
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="http://localhost:8000/api/user/auth/google/"
                className="btn btn-secondary w-full"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
                  <path d="M6.52 7.013v2.96h4.347c-.16 1.013-.613 1.733-1.287 2.24-.773.6-1.76.947-3.06.947-2.427 0-4.48-1.953-4.48-4.38s2.053-4.38 4.48-4.38c1.32 0 2.28.453 3.133 1.347l2.08-2.08C10.007 2.04 8.407 1.333 6.52 1.333c-3.657 0-6.653 2.973-6.653 6.64s2.996 6.64 6.653 6.64c1.93 0 3.397-.64 4.533-1.733 1.16-1.16 1.507-2.773 1.507-4.08 0-.4-.027-.76-.08-1.057H6.52v.27z" fill="#EA4335"/>
                  <path d="M12.48 5.627v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
                  <path d="M6.52 12.24v-2.96H1.59c-.07.305-.107.613-.107.933 0 3.093 2.507 5.6 5.6 5.6 1.587 0 3.027-.627 4.08-1.64l-2.053-1.587c-.56.4-1.28.64-2.027.64-1.493 0-2.76-1.013-3.2-2.387H6.52v1.4z" fill="#FBBC05"/>
                  <path d="M6.52 7.013v2.96h4.347c-.16 1.013-.613 1.733-1.287 2.24-.773.6-1.76.947-3.06.947-2.427 0-4.48-1.953-4.48-4.38s2.053-4.38 4.48-4.38c1.32 0 2.28.453 3.133 1.347l2.08-2.08C10.007 2.04 8.407 1.333 6.52 1.333c-3.657 0-6.653 2.973-6.653 6.64s2.996 6.64 6.653 6.64c1.93 0 3.397-.64 4.533-1.733 1.16-1.16 1.507-2.773 1.507-4.08 0-.4-.027-.76-.08-1.057H6.52v.27z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;