import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'wouter';

interface AuthTogglerProps {
  className?: string;
}

const AuthToggler: React.FC<AuthTogglerProps> = ({ className }) => {
  const [location] = useLocation();
  const isAuth = location === '/auth';
  const [view, setView] = useState<'login' | 'signup'>(
    isAuth ? new URLSearchParams(window.location.search).get('view') === 'signup' ? 'signup' : 'login' : 'login'
  );

  const toggleView = (newView: 'login' | 'signup') => {
    setView(newView);
    if (isAuth) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('view', newView);
      window.history.replaceState(null, '', `?${searchParams.toString()}`);
    }
  };

  return (
    <div className={cn("bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 flex", className)}>
      <Link href={`/auth?view=login`}>
        <button 
          onClick={() => toggleView('login')}
          className={cn(
            "px-3 py-1 text-sm font-medium rounded-md transition-all", 
            view === 'login' 
              ? "bg-white dark:bg-gray-900 shadow-sm" 
              : "text-gray-700 dark:text-gray-300"
          )}
        >
          Sign In
        </button>
      </Link>
      <Link href={`/auth?view=signup`}>
        <button 
          onClick={() => toggleView('signup')}
          className={cn(
            "px-3 py-1 text-sm font-medium rounded-md transition-all", 
            view === 'signup' 
              ? "bg-white dark:bg-gray-900 shadow-sm" 
              : "text-gray-700 dark:text-gray-300"
          )}
        >
          Sign Up
        </button>
      </Link>
    </div>
  );
};

export default AuthToggler;
