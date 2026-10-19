export interface AlgorithmMeta {
  id: string;
  name: string;
  label: string;
  shortDesc: string;
  pageDoc: string;
  category: 'uninformed' | 'informed' | 'local_search' | 'tsp';
  requiresGoal?: boolean;
  requiresHeuristic?: boolean;
  hasBeamWidth?: boolean;
  hasRestarts?: boolean;
  hasBaseCity?: boolean;
  hasStartCity?: boolean;
}

export interface WeekPartMeta {
  partId: string;
  title: string;
  subtitle: string;
  route: 'visualizer' | 'informed' | 'tsp';
  badge: string;
  description: string;
  algorithms: AlgorithmMeta[];
  primaryPdf: string;
}

export interface WeekMeta {
  weekNumber: number;
  title: string;
  badge: string;
  status: 'active' | 'complete' | 'in_development';
  parts: WeekPartMeta[];
}

export const WEEKS_REGISTRY: WeekMeta[] = [
  {
    weekNumber: 2,
    title: 'Uninformed Search',
    badge: 'Week 2',
    status: 'complete',
    parts: [
      {
        partId: 'week-2-uninformed',
        title: 'Uninformed State-Space Search',
        subtitle: 'Queue/Stack/Depth-Bounded Algorithms',
        route: 'visualizer',
        badge: 'Week 2 Core',
        description:
          'Authoritative implementation of state-space search with synchronized OPEN/CLOSED lists, cycle checking, and deterministic replay.',
        primaryPdf: '/docs/algorithms_week2.pdf',
        algorithms: [
          {
            id: 'BFS',
            name: 'Breadth-First Search',
            label: 'BFS',
            shortDesc: 'FIFO Queue exploration; guaranteed shortest path in uniform cost graphs.',
            pageDoc: 'Week 2, Page 2',
            category: 'uninformed',
            requiresGoal: true,
          },
          {
            id: 'DFS',
            name: 'Depth-First Search',
            label: 'DFS',
            shortDesc: 'LIFO Stack exploration; deep branch-first traversal.',
            pageDoc: 'Week 2, Page 3',
            category: 'uninformed',
            requiresGoal: true,
          },
          {
            id: 'DFID-N',
            name: 'Iterative Deepening (New Only)',
            label: 'DFID-N',
            shortDesc: 'Depth-bounded DFS with reopening strictly for newly seen nodes.',
            pageDoc: 'Week 2, Page 3',
            category: 'uninformed',
            requiresGoal: true,
          },
          {
            id: 'DFID-C',
            name: 'Iterative Deepening (Closed Reopen)',
            label: 'DFID-C',
            shortDesc: 'Depth-bounded DFS allowing nodes in CLOSED to reopen across depth bounds.',
            pageDoc: 'Week 2, Page 3',
            category: 'uninformed',
            requiresGoal: true,
          },
        ],
      },
    ],
  },
  {
    weekNumber: 3,
    title: 'Informed Search & TSP',
    badge: 'Week 3',
    status: 'active',
    parts: [
      {
        partId: 'week-3-part-1-informed',
        title: 'Part 1: Informed & Local Search',
        subtitle: 'Heuristic-Guided Search & Optimization',
        route: 'informed',
        badge: 'Week 3 Part 1',
        description:
          'Evaluates states using heuristic distance h(N). Features Best-First Search with alphabetical tie-breaking, bounded Beam Search, and iterative local descent.',
        primaryPdf: '/docs/algorithms_week3.pdf',
        algorithms: [
          {
            id: 'Best-First-Search',
            name: 'Best-First-Search(S)',
            label: 'Best-First',
            shortDesc: 'Frontier sorted by h(N) ascending; alphabetical tie-breaking (Page 2); backtracks parent links.',
            pageDoc: 'Week 3, Page 3, Lines 1–13',
            category: 'informed',
            requiresGoal: true,
            requiresHeuristic: true,
          },
          {
            id: 'Beam-Search',
            name: 'Beam-Search(S, w)',
            label: 'Beam Search',
            shortDesc: 'Layer-wise exploration retaining at most w best candidates via take w (sort_h neighbours).',
            pageDoc: 'Week 3, Page 3, Lines 1–10',
            category: 'informed',
            requiresGoal: true,
            requiresHeuristic: true,
            hasBeamWidth: true,
          },
          {
            id: 'Hill-Climbing',
            name: 'Hill-Climbing(S)',
            label: 'Hill Climbing',
            shortDesc: 'Greedy local move: N ← head sort_h MoveGen(bestEver); halts when no neighbour improves h.',
            pageDoc: 'Week 3, Page 3, Lines 1–5',
            category: 'local_search',
            requiresHeuristic: true,
          },
          {
            id: 'Variable-Neighbourhood-Descent',
            name: 'Variable-Neighbourhood-Descent(S)',
            label: 'VND',
            shortDesc: 'Successively switches neighborhood operators [MoveGen_1, MoveGen_2, ...] at local optima.',
            pageDoc: 'Week 3, Page 3, Lines 1–6',
            category: 'local_search',
            requiresHeuristic: true,
          },
          {
            id: 'Best-Neighbour-Search',
            name: 'Best-Neighbour-Search(S)',
            label: 'Best-Neighbour',
            shortDesc: 'Explores best neighbor unconditionally across iterations while tracking global bestEver.',
            pageDoc: 'Week 3, Page 3, Lines 1–7',
            category: 'local_search',
            requiresHeuristic: true,
          },
          {
            id: 'Iterated-Hill-Climbing',
            name: 'Iterated-Hill-Climbing(N)',
            label: 'Iterated HC',
            shortDesc: 'Multi-start local search with N random restarts to overcome suboptimal local peaks.',
            pageDoc: 'Week 3, Page 3, Lines 1–6',
            category: 'local_search',
            requiresHeuristic: true,
            hasRestarts: true,
          },
        ],
      },
      {
        partId: 'week-3-part-2-tsp',
        title: 'Part 2: Travelling Salesperson Problem',
        subtitle: 'Construction Heuristics & Tour Optimization',
        route: 'tsp',
        badge: 'Week 3 Part 2',
        description:
          'Heuristic tour generation for symmetric TSP: Nearest-Neighbour city hopping, global Greedy edge sorting, and Clarke-Wright Savings merges.',
        primaryPdf: '/docs/algorithms_week3.pdf',
        algorithms: [
          {
            id: 'Nearest-Neighbour-Heuristic',
            name: 'Nearest-Neighbour-Heuristic',
            label: 'Nearest Neighbour',
            shortDesc: 'Greedily transitions to nearest unvisited city, avoiding premature cycles and vertex forks.',
            pageDoc: 'Week 3, Page 4, Lines 1–4',
            category: 'tsp',
            hasStartCity: true,
          },
          {
            id: 'Greedy-Heuristic',
            name: 'Greedy-Heuristic',
            label: 'Greedy (Edges)',
            shortDesc: 'Sorts all edges globally by cost ascending; admits shortest valid edges without forks or sub-loops.',
            pageDoc: 'Week 3, Page 4, Lines 1–4',
            category: 'tsp',
          },
          {
            id: 'Savings-Heuristic',
            name: 'Savings-Heuristic (Clarke-Wright)',
            label: 'Savings (Clarke-Wright)',
            shortDesc: 'Anchors at base city n; computes savings(a, b) = c(n, a) + c(n, b) - c(a, b); merges sub-tours.',
            pageDoc: 'Week 3, Page 4, Lines 1–13',
            category: 'tsp',
            hasBaseCity: true,
          },
        ],
      },
    ],
  },
];

export const COURSE_DOCS = [
  {
    title: 'symbols.pdf',
    label: 'Formal Symbols & Operators',
    desc: 'Lists, cons (:), append (++), tuples, head, tail, pattern matching, take n',
    path: '/docs/symbols.pdf',
    version: 'Ver. 0.3',
  },
  {
    title: 'algorithms_week2.pdf',
    label: 'Week 2: Uninformed Search Specs',
    desc: 'MoveGen, RemoveSeen, MakePairs, ReconstructPath, BFS, DFS, DFID',
    path: '/docs/algorithms_week2.pdf',
    version: 'IIT Madras AI SMPS',
  },
  {
    title: 'algorithms_week3.pdf',
    label: 'Week 3: Informed, Local & TSP Specs',
    desc: 'sort_h tie-breaking, Best-First, Beam Search, Hill-Climbing, TSP Heuristics',
    path: '/docs/algorithms_week3.pdf',
    version: 'IIT Madras AI SMPS',
  },
];
