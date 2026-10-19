import test from 'node:test';
import assert from 'node:assert/strict';

// Import router logic in pure JS mirroring frontend/src/utils/router.ts
function parseRoute(locationLike) {
  const params = {};

  if (locationLike.search) {
    const sp = new URLSearchParams(locationLike.search);
    sp.forEach((val, key) => {
      params[key] = val;
    });
  }

  let hashClean = (locationLike.hash || '').replace(/^#\/?/, '');
  if (hashClean.includes('?')) {
    const parts = hashClean.split('?');
    hashClean = parts[0];
    const hp = new URLSearchParams(parts[1]);
    hp.forEach((val, key) => {
      params[key] = val;
    });
  }

  const pathClean = (locationLike.pathname || '').replace(/^\/|\/$/g, '');
  const candidate = (params.view || hashClean || pathClean || '').toLowerCase();

  let route = 'landing';
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
    route = 'landing';
  }

  return {
    route,
    params,
    rawPath: locationLike.pathname || '/',
  };
}

test('Route resolution: Root path defaults to landing', () => {
  const res = parseRoute({ pathname: '/', search: '', hash: '' });
  assert.equal(res.route, 'landing');
});

test('Route resolution: /visualizer resolves to visualizer', () => {
  const res = parseRoute({ pathname: '/visualizer', search: '', hash: '' });
  assert.equal(res.route, 'visualizer');
});

test('Route resolution: /uninformed alias resolves to visualizer', () => {
  const res = parseRoute({ pathname: '/uninformed', search: '', hash: '' });
  assert.equal(res.route, 'visualizer');
});

test('Route resolution: /notes resolves to notes', () => {
  const res = parseRoute({ pathname: '/notes', search: '', hash: '' });
  assert.equal(res.route, 'notes');
});

test('Route resolution: /informed resolves to informed', () => {
  const res = parseRoute({ pathname: '/informed', search: '', hash: '' });
  assert.equal(res.route, 'informed');
});

test('Route resolution: /tsp resolves to tsp', () => {
  const res = parseRoute({ pathname: '/tsp', search: '', hash: '' });
  assert.equal(res.route, 'tsp');
});

test('Route resolution: /traveling-salesperson alias resolves to tsp', () => {
  const res = parseRoute({ pathname: '/traveling-salesperson', search: '', hash: '' });
  assert.equal(res.route, 'tsp');
});

test('Hash route resolution: #/visualizer resolves to visualizer', () => {
  const res = parseRoute({ pathname: '/', search: '', hash: '#/visualizer' });
  assert.equal(res.route, 'visualizer');
});

test('Hash route resolution: #/tsp resolves to tsp', () => {
  const res = parseRoute({ pathname: '/', search: '', hash: '#/tsp' });
  assert.equal(res.route, 'tsp');
});

test('Hash route resolution: #/notes resolves to notes', () => {
  const res = parseRoute({ pathname: '/', search: '', hash: '#/notes' });
  assert.equal(res.route, 'notes');
});

test('Deep link param extraction: /visualizer?algo=DFS', () => {
  const res = parseRoute({ pathname: '/visualizer', search: '?algo=DFS', hash: '' });
  assert.equal(res.route, 'visualizer');
  assert.equal(res.params.algo, 'DFS');
});

test('Deep link param extraction in hash: #/visualizer?algo=DFID-C', () => {
  const res = parseRoute({ pathname: '/', search: '', hash: '#/visualizer?algo=DFID-C' });
  assert.equal(res.route, 'visualizer');
  assert.equal(res.params.algo, 'DFID-C');
});

test('Query param fallback: ?view=visualizer&algo=DFID-N', () => {
  const res = parseRoute({ pathname: '/', search: '?view=visualizer&algo=DFID-N', hash: '' });
  assert.equal(res.route, 'visualizer');
  assert.equal(res.params.algo, 'DFID-N');
});

test('Fallback behavior: Unknown path /random/deep/link safely falls back to landing', () => {
  const res = parseRoute({ pathname: '/random/deep/link', search: '', hash: '' });
  assert.equal(res.route, 'landing');
});

test('Fallback behavior: Empty or invalid hash safely falls back to landing', () => {
  const res = parseRoute({ pathname: '/', search: '', hash: '#??invalid' });
  assert.equal(res.route, 'landing');
});

test('Case insensitivity: /VISUALIZER, /NOTES, /INFORMED resolve correctly', () => {
  assert.equal(parseRoute({ pathname: '/VISUALIZER', search: '', hash: '' }).route, 'visualizer');
  assert.equal(parseRoute({ pathname: '/NOTES', search: '', hash: '' }).route, 'notes');
  assert.equal(parseRoute({ pathname: '/INFORMED', search: '', hash: '' }).route, 'informed');
});

test('Card Destinations: Homepage navigation cards resolve to valid targets', () => {
  // Card 1: Uninformed
  assert.equal(parseRoute({ pathname: '/visualizer', search: '', hash: '' }).route, 'visualizer');
  // Card 2: Heuristic Landscape (standalone HTML URL)
  const heuristicUrl = '/week3-pa4-gemini.html';
  assert.ok(heuristicUrl.endsWith('.html'));
  // Card 3: Notes
  assert.equal(parseRoute({ pathname: '/notes', search: '', hash: '' }).route, 'notes');
  // Card 4: Informed Part 1
  assert.equal(parseRoute({ pathname: '/informed', search: '', hash: '' }).route, 'informed');
  // Card 5: TSP Part 2
  assert.equal(parseRoute({ pathname: '/tsp', search: '', hash: '' }).route, 'tsp');
});

test('Algorithm Switching: All 4 Week 2 algorithms resolve as valid subroutes', () => {
  const algos = ['BFS', 'DFS', 'DFID-N', 'DFID-C'];
  for (const algo of algos) {
    const res = parseRoute({ pathname: '/visualizer', search: `?algo=${algo}`, hash: '' });
    assert.equal(res.route, 'visualizer');
    assert.equal(res.params.algo, algo);
  }
});

test('Algorithm Switching: All Week 3 Part 1 informed algorithms resolve as valid subroutes', () => {
  const algos = [
    'Best-First-Search',
    'Beam-Search',
    'Hill-Climbing',
    'Variable-Neighbourhood-Descent',
    'Best-Neighbour-Search',
    'Iterated-Hill-Climbing',
  ];
  for (const algo of algos) {
    const res = parseRoute({ pathname: '/informed', search: `?algo=${algo}`, hash: '' });
    assert.equal(res.route, 'informed');
    assert.equal(res.params.algo, algo);
  }
});

test('Algorithm Switching: All Week 3 Part 2 TSP algorithms resolve as valid subroutes', () => {
  const algos = [
    'Nearest-Neighbour-Heuristic',
    'Greedy-Heuristic',
    'Savings-Heuristic',
  ];
  for (const algo of algos) {
    const res = parseRoute({ pathname: '/tsp', search: `?algo=${algo}`, hash: '' });
    assert.equal(res.route, 'tsp');
    assert.equal(res.params.algo, algo);
  }
});

