import { useState } from 'react';

export function useNavigate() {
  const [, setLocation] = useState(window.location.pathname);

  return (path: string) => {
    window.history.pushState({}, '', path);
    setLocation(path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
}
