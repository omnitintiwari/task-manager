import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-9xl font-extrabold text-indigo-600 dark:text-indigo-400">404</h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            Page not found
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            We couldn't find the page you're looking for.
          </p>
        </div>
        <div>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Home className="h-5 w-5 mr-2" />
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;