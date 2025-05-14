import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Moon, Sun } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-12 h-12 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        User Profile
      </h1>
      
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-4">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {user.username}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Username
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {user.username}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {user.email}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Role
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                {user.role}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Theme
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                <button
                  onClick={toggleTheme}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4 mr-2" /> Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 mr-2" /> Dark Mode
                    </>
                  )}
                </button>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Profile;