import { useEffect, useState } from 'react';
import { Home } from '../pages/Home';
import { SignIn } from '../pages/SignIn';
import { SignUp } from '../pages/SignUp';
import { Dashboard } from '../pages/Dashboard';

export function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  switch (currentPath) {
    case '/signin':
      return <SignIn />;
    case '/signup':
      return <SignUp />;
    case '/dashboard':
      return <Dashboard />;
    default:
      return <Home />;
  }
}
