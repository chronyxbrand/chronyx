import { useEffect, useState } from 'react';

function getRouteLabel(pathname) {
  if (pathname === '/') return 'Home';

  const segment = pathname
    .split('/')
    .filter(Boolean)
    .at(0);

  if (!segment) return 'CHRONYX';
  return segment.replace(/-/g, ' ');
}

function PageTransitionVeil({ pathname }) {
  const [activePath, setActivePath] = useState(pathname);

  useEffect(() => {
    setActivePath(pathname);

    const timer = window.setTimeout(() => {
      setActivePath('');
    }, 760);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!activePath) return null;

  return (
    <div className="page-transition-veil" aria-hidden="true">
      <div className="page-transition-grain" />
      <div className="page-transition-line" />
      <span>{getRouteLabel(activePath)}</span>
    </div>
  );
}

export default PageTransitionVeil;
