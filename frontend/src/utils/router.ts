export type AppRoute = 'landing' | 'visualizer' | 'notes' | 'informed' | 'tsp';

export interface RouteState {
  route: AppRoute;
  params: Record<string, string>;
  rawPath: string;
}

/**
 * Parses route state from standard or simulated location objects.
 * Supports pathname routing (/visualizer), hash routing (#/visualizer),
 * and query parameters (?view=visualizer&algo=DFS).
 */
export function parseRoute(locationLike: {
  pathname: string;
  search: string;
  hash: string;
}): RouteState {
  // Extract query params from both search and hash query strings
  const params: Record<string, string> = {};

  if (locationLike.search) {
    const sp = new URLSearchParams(locationLike.search);
    sp.forEach((val, key) => {
      params[key] = val;
    });
  }

  // Check hash for routes (#/visualizer) or hash queries (#/visualizer?algo=DFS)
  let hashClean = locationLike.hash.replace(/^#\/?/, '');
  if (hashClean.includes('?')) {
    const parts = hashClean.split('?');
    hashClean = parts[0];
    const hp = new URLSearchParams(parts[1]);
    hp.forEach((val, key) => {
      params[key] = val;
    });
  }

  // Clean pathname (e.g., "/visualizer" -> "visualizer")
  const pathClean = locationLike.pathname.replace(/^\/|\/$/g, '');

  // Priority order: explicit ?view= param, then clean hash, then pathname
  const candidate = (params.view || hashClean || pathClean || '').toLowerCase();

  let route: AppRoute = 'landing';
  if (
    candidate === 'visualizer' ||
    candidate === 'uninformed' ||
    candidate === 'search'
  ) {
    route = 'visualizer';
  } else if (
    candidate === 'notes' ||
    candidate === 'spec' ||
    candidate === 'docs'
  ) {
    route = 'notes';
  } else if (
    candidate === 'informed' ||
    candidate === 'heuristics-algorithms'
  ) {
    route = 'informed';
  } else if (
    candidate === 'tsp' ||
    candidate === 'traveling-salesperson' ||
    candidate === 'tsp-heuristics'
  ) {
    route = 'tsp';
  } else {
    // Graceful fallback for root or any unrecognized path
    route = 'landing';
  }

  return {
    route,
    params,
    rawPath: locationLike.pathname,
  };
}

/**
 * Safe navigation function that pushes browser history state and dispatches
 * a custom event for instant, non-reloading UI updates.
 */
export function navigateTo(
  route: AppRoute,
  queryParams: Record<string, string> = {}
): void {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    if (value) params.set(key, value);
  }
  const queryString = params.toString() ? `?${params.toString()}` : '';

  let path = '/';
  if (route === 'visualizer') path = '/visualizer';
  else if (route === 'notes') path = '/notes';
  else if (route === 'informed') path = '/informed';
  else if (route === 'tsp') path = '/tsp';

  const fullUrl = `${path}${queryString}`;

  if (typeof window !== 'undefined') {
    if (
      window.location.pathname !== path ||
      window.location.search !== queryString
    ) {
      window.history.pushState({ route, params: queryParams }, '', fullUrl);
    }
    window.dispatchEvent(
      new CustomEvent('app:navigate', {
        detail: { route, params: queryParams },
      })
    );
  }
}
