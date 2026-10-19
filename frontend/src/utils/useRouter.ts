import { useState, useEffect, useCallback } from 'react';
import { parseRoute, navigateTo } from './router';
import type { AppRoute, RouteState } from './router';

export function useRouter() {
  const [routeState, setRouteState] = useState<RouteState>(() => {
    if (typeof window === 'undefined') {
      return { route: 'landing', params: {}, rawPath: '/' };
    }
    return parseRoute(window.location);
  });

  const syncRoute = useCallback(() => {
    if (typeof window !== 'undefined') {
      setRouteState(parseRoute(window.location));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('app:navigate', syncRoute as EventListener);

    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('app:navigate', syncRoute as EventListener);
    };
  }, [syncRoute]);

  const go = useCallback((route: AppRoute, params?: Record<string, string>) => {
    navigateTo(route, params);
  }, []);

  return {
    ...routeState,
    navigate: go,
  };
}
