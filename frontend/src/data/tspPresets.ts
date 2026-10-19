export interface TSPPreset {
  id: string
  name: string
  badge: string
  badgeColor: string
  cities: string[]
  costs: Record<string, Record<string, number>>
  defaultStartCity: string
  defaultBaseCity: string
  description: string
  nnAnalysis: {
    pros: string
    cons: string
  }
  greedyAnalysis: {
    pros: string
    cons: string
  }
  savingsAnalysis: {
    pros: string
    cons: string
  }
  contrastSummary: string
}

export const TSP_PRESETS: TSPPreset[] = [
  {
    id: 'nn-outlier-trap',
    name: 'Nearest-Neighbour Outlier Trap',
    badge: 'NN Cost Explosion (23 vs 11)',
    badgeColor: '#ec4899',
    cities: ['A', 'B', 'C', 'D', 'E'],
    defaultStartCity: 'A',
    defaultBaseCity: 'A',
    description:
      'Demonstrates the classic failure mode of Nearest-Neighbour: greedily hopping to adjacent clustered cities leaves an isolated vertex (D) for last, forcing an exorbitant return leg back to start.',
    costs: {
      A: { B: 2, C: 2, D: 15, E: 3 },
      B: { A: 2, C: 2, D: 3, E: 15 },
      C: { A: 2, B: 2, D: 15, E: 2 },
      D: { A: 15, B: 3, C: 15, E: 2 },
      E: { A: 3, B: 15, C: 2, D: 2 },
    },
    nnAnalysis: {
      pros: 'Extremely fast O(N^2) greedy step; performs reasonably well on uniform clusters.',
      cons: 'Completely blind to the remaining tour cost. Leaving D for the end forces a massive 15-cost return leg, exploding total tour cost to 23.',
    },
    greedyAnalysis: {
      pros: 'Sorts all edges globally, selecting the cheap 2-cost and 3-cost edges to achieve the optimal tour cost of 11.',
      cons: 'Can get blocked by degree constraints on other topologies.',
    },
    savingsAnalysis: {
      pros: 'Sub-tour merging based on triangle savings s(i,j) smoothly combines clusters, finding the exact optimal tour of 11.',
      cons: 'Dependent on base city selection.',
    },
    contrastSummary:
      'NN incurs a cost of 23.0 due to the isolated return leg (D -> A = 15). In contrast, Greedy and Savings both achieve the optimal tour with cost 11.0 (>100% cost improvement over NN)!',
  },
  {
    id: 'greedy-deadlock-trap',
    name: 'Greedy Degree-Constraint Deadlock',
    badge: 'Greedy Deadlock (32 vs 22)',
    badgeColor: '#f59e0b',
    cities: ['A', 'B', 'C', 'D', 'E'],
    defaultStartCity: 'A',
    defaultBaseCity: 'A',
    description:
      'Demonstrates the fundamental flaw of Greedy Edge Sorting: eagerly picking globally cheap edges saturates vertex degrees and forces high-cost emergency connector edges to close the tour.',
    costs: {
      A: { B: 4, C: 1, D: 9, E: 8 },
      B: { A: 4, C: 8, D: 5, E: 4 },
      C: { A: 1, B: 8, D: 18, E: 3 },
      D: { A: 9, B: 5, C: 18, E: 19 },
      E: { A: 8, B: 4, C: 3, D: 19 },
    },
    nnAnalysis: {
      pros: 'Maintains a continuous path, avoiding disjoint segment lock-in and achieving a tour cost of 22.',
      cons: 'Sensitive to starting city choice.',
    },
    greedyAnalysis: {
      pros: 'Quickly grabs the ultra-cheap edges (A,C)=1, (C,E)=3, (A,B)=4, (B,D)=5.',
      cons: 'After grabbing cheap edges, degree saturation and premature cycle rejection force Greedy to take the exorbitant bridging edge (D, E) = 19, pushing total cost to 32.',
    },
    savingsAnalysis: {
      pros: 'Avoids premature disjoint segments by anchoring all merges at base depot A, smoothly achieving a tour cost of 22.',
      cons: 'Requires calculating pairwise savings values.',
    },
    contrastSummary:
      'Greedy gets trapped: degree limits force it to take the expensive edge (D, E) = 19, resulting in total cost 32.0. Both Nearest-Neighbour and Savings find the much superior tour with cost 22.0!',
  },
  {
    id: 'hub-and-spoke-savings',
    name: 'Clarke-Wright Savings Triumph',
    badge: 'Savings Triumph (44 vs 76)',
    badgeColor: '#10b981',
    cities: ['A', 'B', 'C', 'D', 'E'],
    defaultStartCity: 'A',
    defaultBaseCity: 'A',
    description:
      'A canonical depot routing topology where base city A serves as the distribution hub. The Clarke-Wright savings formula prioritizes customer consolidation, decisively beating NN and Greedy.',
    costs: {
      A: { B: 4, C: 13, D: 30, E: 13 },
      B: { A: 4, C: 6, D: 8, E: 6 },
      C: { A: 13, B: 6, D: 12, E: 7 },
      D: { A: 30, B: 8, C: 12, E: 29 },
      E: { A: 13, B: 6, C: 7, D: 29 },
    },
    nnAnalysis: {
      pros: 'Good on local clusters, but gets misled into a high-cost tour of 76.',
      cons: 'Does not exploit hub-and-spoke triangle savings.',
    },
    greedyAnalysis: {
      pros: 'Eagerly selects local edges, but gets locked into a suboptimal tour of 76.',
      cons: 'Lacks global depot orientation.',
    },
    savingsAnalysis: {
      pros: 'Computes savings s(i,j) = c(A,i) + c(A,j) - c(i,j). Merges sub-tours in near-optimal sequence, discovering the winning tour with cost 44 (a massive 32-cost advantage)!',
      cons: 'Requires designating an appropriate depot / base city.',
    },
    contrastSummary:
      'Savings Heuristic decisively triumphs here: total cost 44.0 vs 76.0 for both Nearest-Neighbour and Greedy (a massive 42% cost reduction achieved by Clarke-Wright consolidation)!',
  },
  {
    id: 'iitm-canonical-5city',
    name: 'IIT Madras Week 3 Canonical Benchmark',
    badge: 'Official Syllabus Baseline',
    badgeColor: '#3b82f6',
    cities: ['A', 'B', 'C', 'D', 'E'],
    defaultStartCity: 'A',
    defaultBaseCity: 'A',
    description:
      'The reference 5-city distance matrix from IIT Madras AI SMPS Week 3 lecture notes and assignments.',
    costs: {
      A: { B: 12, C: 10, D: 19, E: 8 },
      B: { A: 12, C: 3, D: 7, E: 20 },
      C: { A: 10, B: 3, D: 6, E: 14 },
      D: { A: 19, B: 7, C: 6, E: 11 },
      E: { A: 8, B: 20, C: 14, D: 11 },
    },
    nnAnalysis: {
      pros: 'From start A: hops to E(8) -> D(11) -> C(6) -> B(3) -> A(12) = 40.',
      cons: 'Start city selection affects tour quality.',
    },
    greedyAnalysis: {
      pros: 'Edge order: (B,C)=3, (C,D)=6, (A,E)=8, (D,E)=11, (A,B)=12. Total cost: 40.',
      cons: 'Discards cheaper edges that would form premature cycles.',
    },
    savingsAnalysis: {
      pros: 'Base A: sub-tours [A,B,A], [A,C,A], [A,D,A], [A,E,A]. Savings s(B,C)=19 merges B and C.',
      cons: 'Requires systematic tracking of adjacent endpoints.',
    },
    contrastSummary:
      'All three heuristics perform competitively on this balanced benchmark, finding valid tours of cost 40-44 and demonstrating standard trace event sequences.',
  },
  {
    id: 'convex-ring-optimal',
    name: 'Convex Perimeter Ring (All Heuristics Optimal)',
    badge: 'Optimal Ring Convergence',
    badgeColor: '#8b5cf6',
    cities: ['A', 'B', 'C', 'D', 'E', 'F'],
    defaultStartCity: 'A',
    defaultBaseCity: 'A',
    description:
      'A symmetric 6-city regular polygon where the triangle inequality holds strictly. Illustrates the ideal conditions under which NN, Greedy, and Savings all converge to the optimal perimeter tour.',
    costs: {
      A: { B: 5, C: 9, D: 12, E: 9, F: 5 },
      B: { A: 5, C: 5, D: 9, E: 12, F: 9 },
      C: { A: 9, B: 5, D: 5, E: 9, F: 12 },
      D: { A: 12, B: 9, C: 5, E: 5, F: 9 },
      E: { A: 9, B: 12, C: 9, D: 5, F: 5 },
      F: { A: 5, B: 9, C: 12, D: 9, E: 5 },
    },
    nnAnalysis: {
      pros: 'Always hops to adjacent vertex along the perimeter (cost 5 each step).',
      cons: 'None in this topology.',
    },
    greedyAnalysis: {
      pros: 'All 6 perimeter edges cost 5 and are selected in order.',
      cons: 'None in this topology.',
    },
    savingsAnalysis: {
      pros: 'Adjacent perimeter pairs have highest savings, smoothly stitching the outer ring.',
      cons: 'None in this topology.',
    },
    contrastSummary:
      'On a convex geometric ring, every heuristic achieves the exact optimal perimeter tour with cost 30 (6 edges x 5), proving their correctness under ideal metric conditions.',
  },
  {
    id: 'clustered-islands-bridge-trap',
    name: 'Clustered Islands & Premature Bridge Trap',
    badge: 'Bridge Trap (42 vs 24)',
    badgeColor: '#ef4444',
    cities: ['A', 'B', 'C', 'D', 'E', 'F'],
    defaultStartCity: 'A',
    defaultBaseCity: 'A',
    description:
      'Two 3-city clusters {A,B,C} and {D,E,F} separated by a chokepoint. A cheap inter-cluster shortcut (B,D)=2 lures Nearest-Neighbour into crossing prematurely before visiting C, stranding C and forcing a disastrous return leg.',
    costs: {
      A: { B: 3, C: 6, D: 18, E: 22, F: 5 },
      B: { A: 3, C: 4, D: 2, E: 20, F: 22 },
      C: { A: 6, B: 4, D: 5, E: 20, F: 24 },
      D: { A: 18, B: 2, C: 5, E: 3, F: 6 },
      E: { A: 22, B: 20, C: 20, D: 3, F: 4 },
      F: { A: 5, B: 22, C: 24, D: 6, E: 4 },
    },
    nnAnalysis: {
      pros: 'Quickly navigates local edges (A->B=3).',
      cons: 'At city B, lured by shortcut (B,D)=2 instead of finishing cluster (B,C)=4. Strands city C on Island 1, requiring an exorbitant 24-cost bridging edge (F,C) and inflating total cost to 42.',
    },
    greedyAnalysis: {
      pros: 'Sorts all edges globally, prioritizing cheap internal connections.',
      cons: 'Eagerly taking shortcut (B,D)=2 can lock vertex degrees at B and D, complicating cluster consolidation.',
    },
    savingsAnalysis: {
      pros: 'Anchors sub-tours from depot A and merges high-savings connections first, completely avoiding the premature bridge trap and discovering the optimal tour of 24 (A->B->C->D->E->F->A)!',
      cons: 'Requires careful depot anchoring.',
    },
    contrastSummary:
      'Nearest-Neighbour falls into the bridge trap: crossing from B to D prematurely strands C, forcing cost 42.0. In contrast, Clarke-Wright Savings consolidates both clusters systematically, achieving the optimal cost of 24.0 (a 43% cost reduction)!',
  },
]
