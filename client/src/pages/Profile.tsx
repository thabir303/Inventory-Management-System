import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

interface ProfileFormValues {
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
}

const ProfileSchema = Yup.object().shape({
  username: Yup.string().min(3, 'Username must be at least 3 characters'),
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  bio: Yup.string(),
});

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!user) {
    return null;
  }

  const initialValues: ProfileFormValues = {
    username: user.username || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    bio: user.bio || '',
  };

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      await updateUser(values);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div>
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-lg font-semibold leading-6 text-gray-900">Edit Profile</h2>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Update your account information.
        </p>
      </div>
      
      <div className="mt-6">
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Profile updated successfully!
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <Formik
          initialValues={initialValues}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="mt-1">
                    <Field
                      id="first_name"
                      name="first_name"
                      type="text"
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    />
                    <ErrorMessage name="first_name" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <div className="mt-1">
                    <Field
                      id="last_name"
                      name="last_name"
                      type="text"
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    />
                    <ErrorMessage name="last_name" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <Field
                    id="username"
                    name="username"
                    type="text"
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  />
                  <ErrorMessage name="username" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <div className="mt-1">
                  <Field
                    as="textarea"
                    id="bio"
                    name="bio"
                    rows={4}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  />
                  <ErrorMessage name="bio" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Profile;