import React, { useState } from 'react'
import type { GraphData } from '../types'
import {
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Dices,
  Code,
} from 'lucide-react'

export interface InformedPreset {
  id: string
  name: string
  badge: string
  badgeColor: string
  concept: string
  loopholeExplanation: string
  recommendedAlgo: string
  recommendedParams?: { beamWidth?: number; restarts?: number }
  graph: GraphData
  heuristic: Record<string, number>
}

export const INFORMED_PRESETS: InformedPreset[] = [
  {
    id: 'beam-search-pitfall',
    name: 'Beam Search Pruning Pitfall (w=1 vs w=2)',
    badge: 'Beam Pruning Loophole',
    badgeColor: '#ec4899',
    concept:
      'Beam Search retains only the top w candidate nodes at each depth level, permanently discarding all other branches without backtracking.',
    loopholeExplanation:
      'With beam width w=1, Beam Search greedily retains only A (h=3) because h(A) < h(B) (3 < 5). Branch A leads to dead-ends C (h=8) and D (h=7), causing the algorithm to stagnate at A without ever discovering Goal G! With w=2, both A and B are retained in OPEN, allowing the search to discover G at the next level.',
    recommendedAlgo: 'Beam-Search',
    recommendedParams: { beamWidth: 1 },
    graph: {
      nodes: ['S', 'A', 'B', 'C', 'D', 'G'],
      edges: {
        S: ['A', 'B'],
        A: ['C', 'D'],
        B: ['G'],
        C: [],
        D: [],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
      metadata: { name: 'Beam Search Pruning Pitfall' },
    },
    heuristic: {
      S: 10,
      A: 3,
      B: 5,
      C: 8,
      D: 7,
      G: 0,
    },
  },
  {
    id: 'local-optimum-trap',
    name: 'Local Optimum Trap (Hill Climbing vs VND / IHC)',
    badge: 'Local Minima Trap',
    badgeColor: '#f59e0b',
    concept:
      'Hill Climbing terminates as soon as no immediate neighbour has a strictly better heuristic value, getting trapped in local optima.',
    loopholeExplanation:
      'From S (h=10), Hill Climbing greedily steps to A (h=4) instead of B (h=6). At node A, all neighbours (C with h=7, D with h=8) are strictly worse. Thus, Hill Climbing halts at suboptimal local minimum A! In contrast, Best-First Search backtracks via OPEN to explore B -> E -> G, and VND or Iterated HC escape via broader neighbourhoods or restarts.',
    recommendedAlgo: 'Hill-Climbing',
    recommendedParams: { restarts: 5 },
    graph: {
      nodes: ['S', 'A', 'B', 'C', 'D', 'E', 'G'],
      edges: {
        S: ['A', 'B'],
        A: ['C', 'D'],
        B: ['E'],
        C: ['E'],
        D: [],
        E: ['G'],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
      metadata: { name: 'Local Optimum Trap' },
    },
    heuristic: {
      S: 10,
      A: 4,
      B: 6,
      C: 7,
      D: 8,
      E: 2,
      G: 0,
    },
  },
  {
    id: 'plateau-stagnation',
    name: 'Plateau & Shoulder Stagnation (h(N) == h(bestEver))',
    badge: 'Strict Inequality Loophole',
    badgeColor: '#06b6d4',
    concept:
      'Week 3 Page 3 Line 4 explicitly specifies `while h(N) is better than h(bestEver)`. On flat plateaus or shoulders where heuristic values are identical, strict inequality fails.',
    loopholeExplanation:
      'Along path S (h=8) -> A (h=5) -> B (h=5) -> C (h=5) -> G (h=0), states A, B, and C form a flat heuristic plateau (h=5). When at A, neighbour B has h(B)=5, which is NOT strictly better than h(A)=5. Hill Climbing and Beam Search immediately halt at A, unable to traverse flat shoulders to reach Goal G!',
    recommendedAlgo: 'Hill-Climbing',
    recommendedParams: { beamWidth: 2 },
    graph: {
      nodes: ['S', 'A', 'B', 'C', 'G'],
      edges: {
        S: ['A'],
        A: ['B'],
        B: ['C'],
        C: ['G'],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
      metadata: { name: 'Plateau Stagnation' },
    },
    heuristic: {
      S: 8,
      A: 5,
      B: 5,
      C: 5,
      G: 0,
    },
  },
  {
    id: 'authoritative-tie-breaker',
    name: 'Authoritative Tie-Breaker (Alphabetical Order)',
    badge: 'Deterministic Tie-Break',
    badgeColor: '#8b5cf6',
    concept:
      'When two nodes have identical heuristic values, Week 3 Page 2 & 3 mandates deterministic tie-breaking by alphabetical order of node labels.',
    loopholeExplanation:
      'From S, both A and B have identical heuristic h=3.0. In sort_h, secondary sorting puts A before B alphabetically. In Best-First, A is explored first; in Beam Search with w=1, branch A is selected and branch B is discarded.',
    recommendedAlgo: 'Best-First-Search',
    recommendedParams: { beamWidth: 1 },
    graph: {
      nodes: ['S', 'A', 'B', 'C', 'D', 'G'],
      edges: {
        S: ['A', 'B'],
        A: ['C'],
        B: ['D'],
        C: ['G'],
        D: ['G'],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
      metadata: { name: 'Authoritative Tie-Breaker' },
    },
    heuristic: {
      S: 6,
      A: 3,
      B: 3,
      C: 2,
      D: 2,
      G: 0,
    },
  },
  {
    id: 'deceptive-heuristic',
    name: 'Deceptive Heuristic Search Tree',
    badge: 'Greedy Misdirection',
    badgeColor: '#10b981',
    concept:
      'A greedy heuristic value that looks superficially attractive near the start can lead into an expensive dead-end tree.',
    loopholeExplanation:
      'Node A has an enticing h=1, so local algorithms commit to branch A. However, its children C and D jump to h=9! Meanwhile, branch B has h=4, leading smoothly to E (h=2) and G (h=0). Best-First Search successfully recovers because OPEN retains (B, S, 4), allowing systematic backtracking.',
    recommendedAlgo: 'Best-First-Search',
    recommendedParams: { beamWidth: 2 },
    graph: {
      nodes: ['S', 'A', 'B', 'C', 'D', 'E', 'G'],
      edges: {
        S: ['A', 'B'],
        A: ['C', 'D'],
        B: ['E'],
        C: [],
        D: [],
        E: ['G'],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
      metadata: { name: 'Deceptive Heuristic' },
    },
    heuristic: {
      S: 10,
      A: 1,
      B: 4,
      C: 9,
      D: 9,
      E: 2,
      G: 0,
    },
  },
  {
    id: 'iitm-week3-canonical',
    name: 'IIT Madras Week 3 Canonical Example',
    badge: 'Official Syllabus Baseline',
    badgeColor: '#3b82f6',
    concept:
      'The canonical 7-node search tree from IIT Madras AI SMPS Week 3 lecture notes and assignments.',
    loopholeExplanation:
      'Demonstrates standard informed search behavior where Best-First and Beam Search find the optimal path S -> B -> G while properly updating OPEN and CLOSED states.',
    recommendedAlgo: 'Best-First-Search',
    recommendedParams: { beamWidth: 2 },
    graph: {
      nodes: ['S', 'A', 'B', 'C', 'D', 'E', 'G'],
      edges: {
        S: ['A', 'B'],
        A: ['C', 'D'],
        B: ['E', 'G'],
        C: [],
        D: ['G'],
        E: [],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
      metadata: { name: 'IIT Madras Week 3 Tree' },
    },
    heuristic: {
      S: 10,
      A: 6,
      B: 4,
      C: 8,
      D: 2,
      E: 5,
      G: 0,
    },
  },
]

export interface InformedGraphConfigModalProps {
  isOpen: boolean
  onClose: () => void
  currentGraph: GraphData
  currentHeuristic: Record<string, number>
  onApplyGraphAndHeuristic: (
    graph: GraphData,
    heuristic: Record<string, number>,
    recommendedAlgo?: string,
    recommendedParams?: { beamWidth?: number; restarts?: number }
  ) => void
}

export const InformedGraphConfigModal: React.FC<InformedGraphConfigModalProps> = ({
  isOpen,
  onClose,
  currentGraph,
  currentHeuristic,
  onApplyGraphAndHeuristic,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'generator'>('presets')

  // Selected preset state
  const [selectedPresetId, setSelectedPresetId] = useState<string>(INFORMED_PRESETS[0].id)

  // Custom JSON editor state
  const [customJson, setCustomJson] = useState(() =>
    JSON.stringify(
      {
        graph: currentGraph,
        heuristic: currentHeuristic,
      },
      null,
      2
    )
  )
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [customSubMode, setCustomSubMode] = useState<'form' | 'json'>('form')

  // Visual custom form state
  const [formNodes, setFormNodes] = useState<string>(() => currentGraph.nodes.join(', '))
  const [formStart, setFormStart] = useState<string>(() => currentGraph.start_node)
  const [formGoal, setFormGoal] = useState<string>(() => currentGraph.goal_node)
  const [formEdgesText, setFormEdgesText] = useState<string>(() => {
    return Object.entries(currentGraph.edges)
      .map(([u, vList]) => `${u} -> ${vList.join(', ')}`)
      .join('\n')
  })
  const [formHeuristics, setFormHeuristics] = useState<Record<string, number>>(() => ({
    ...currentHeuristic,
  }))

  // Generator state
  const [genNodeCount, setGenNodeCount] = useState<number>(7)
  const [genBranching, setGenBranching] = useState<number>(2)
  const [genSeed, setGenSeed] = useState<number>(42)

  if (!isOpen) return null

  const handleApplyPreset = (preset: InformedPreset) => {
    onApplyGraphAndHeuristic(
      preset.graph,
      preset.heuristic,
      preset.recommendedAlgo,
      preset.recommendedParams
    )
    onClose()
  }

  const handleApplyCustomJson = () => {
    try {
      const parsed = JSON.parse(customJson)
      const graphData: GraphData = parsed.graph || parsed
      const heuristicData: Record<string, number> = parsed.heuristic || {}

      if (!Array.isArray(graphData.nodes) || !graphData.edges || !graphData.start_node || !graphData.goal_node) {
        throw new Error("Invalid graph format: must contain 'nodes', 'edges', 'start_node', and 'goal_node'")
      }

      // Deduplicate nodes
      graphData.nodes = Array.from(new Set(graphData.nodes))

      // Check node heuristics
      for (const node of graphData.nodes) {
        if (heuristicData[node] === undefined) {
          heuristicData[node] = node === graphData.goal_node ? 0 : 5
        }
      }

      onApplyGraphAndHeuristic(graphData, heuristicData)
      setJsonError(null)
      onClose()
    } catch (err: any) {
      setJsonError(err.message || 'JSON parsing error')
    }
  }

  const handleApplyFormGraph = () => {
    try {
      const rawNodes = formNodes
        .split(',')
        .map((n) => n.trim().toUpperCase())
        .filter((n) => n.length > 0)
      const nodes = Array.from(new Set(rawNodes))

      if (nodes.length === 0) {
        throw new Error('Graph must have at least one node')
      }

      const start = formStart.trim().toUpperCase()
      const goal = formGoal.trim().toUpperCase()

      if (!nodes.includes(start)) {
        throw new Error(`Start node '${start}' must be in the nodes list`)
      }
      if (!nodes.includes(goal)) {
        throw new Error(`Goal node '${goal}' must be in the nodes list`)
      }

      // Parse edges text
      const edges: Record<string, string[]> = {}
      nodes.forEach((n) => (edges[n] = []))

      const lines = formEdgesText.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        const parts = trimmed.split(/->|:/)
        if (parts.length >= 2) {
          const u = parts[0].trim().toUpperCase()
          const vList = parts[1]
            .split(',')
            .map((v) => v.trim().toUpperCase())
            .filter((v) => v.length > 0)

          if (nodes.includes(u)) {
            for (const v of vList) {
              if (nodes.includes(v) && !edges[u].includes(v)) {
                edges[u].push(v)
              }
            }
          }
        }
      }

      // Build heuristic
      const cleanHeuristic: Record<string, number> = {}
      for (const n of nodes) {
        const hVal = formHeuristics[n] !== undefined ? Number(formHeuristics[n]) : (n === goal ? 0 : 5)
        cleanHeuristic[n] = isNaN(hVal) ? 0 : Math.max(0, hVal)
      }

      const graphData: GraphData = {
        nodes,
        edges,
        start_node: start,
        goal_node: goal,
        metadata: { name: 'Custom Heuristic Graph' },
      }

      onApplyGraphAndHeuristic(graphData, cleanHeuristic)
      setJsonError(null)
      onClose()
    } catch (err: any) {
      setJsonError(err.message)
    }
  }

  const handleGenerateGraph = () => {
    // Generate deterministic tree/DAG with seed
    const total = Math.max(3, Math.min(genNodeCount, 20))
    // Intermediate node pool strictly excludes 'S' (Start) and 'G' (Goal) to guarantee uniqueness
    const pool = 'ABCDEFHIJKLMNOPQRTUVWXYZ'.split('')
    const intermediateCount = total - 2
    const intermediateNodes = pool.slice(0, intermediateCount)
    const nodes: string[] = ['S', ...intermediateNodes, 'G']

    const edges: Record<string, string[]> = {}
    nodes.forEach((n) => (edges[n] = []))

    // Simple pseudo-random from seed
    let s = genSeed
    const rand = () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }

    // Connect layers to ensure path from S to G
    for (let i = 0; i < nodes.length - 1; i++) {
      const u = nodes[i]
      const potentialTargets = nodes.slice(i + 1)
      const count = Math.max(1, Math.min(genBranching, potentialTargets.length))
      for (let j = 0; j < count; j++) {
        const target = potentialTargets[j]
        if (!edges[u].includes(target)) {
          edges[u].push(target)
        }
      }
    }

    // Generate heuristics: G has 0, others estimate distance to G
    const cleanHeuristic: Record<string, number> = {}
    nodes.forEach((n, idx) => {
      if (n === 'G') {
        cleanHeuristic[n] = 0
      } else {
        // Distance roughly proportional to remaining steps + pseudo-random noise
        const stepsToGoal = nodes.length - 1 - idx
        const noise = Math.floor(rand() * 3)
        cleanHeuristic[n] = Math.max(1, stepsToGoal * 2 + noise)
      }
    })

    const generatedGraph: GraphData = {
      nodes,
      edges,
      start_node: 'S',
      goal_node: 'G',
      metadata: { name: `Generated Informed Graph (${nodes.length} nodes)` },
    }

    onApplyGraphAndHeuristic(generatedGraph, cleanHeuristic)
    onClose()
  }

  const activePreset = INFORMED_PRESETS.find((p) => p.id === selectedPresetId) || INFORMED_PRESETS[0]

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 780,
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 16,
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(139, 92, 246, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Informed Search Graph & Heuristics Configuration
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
                Select educational presets explaining algorithm loopholes or configure custom node heuristics h(N)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0 20px',
            background: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <button
            onClick={() => setActiveTab('presets')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'presets' ? '2px solid #a855f7' : '2px solid transparent',
              color: activeTab === 'presets' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Sparkles size={15} style={{ color: activeTab === 'presets' ? '#a855f7' : 'inherit' }} />
            <span>Handcrafted Presets & Loopholes</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'custom' ? '2px solid #a855f7' : '2px solid transparent',
              color: activeTab === 'custom' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Code size={15} style={{ color: activeTab === 'custom' ? '#a855f7' : 'inherit' }} />
            <span>Custom Graph & Heuristics</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'generator' ? '2px solid #a855f7' : '2px solid transparent',
              color: activeTab === 'generator' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Dices size={15} style={{ color: activeTab === 'generator' ? '#a855f7' : 'inherit' }} />
            <span>Deterministic Generator</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: 22, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div style={{ display: 'flex', gap: 18, height: '100%', minHeight: 380 }}>
              {/* Presets List */}
              <div
                style={{
                  width: '42%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  overflowY: 'auto',
                  paddingRight: 6,
                }}
              >
                {INFORMED_PRESETS.map((p) => {
                  const isSelected = p.id === selectedPresetId
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPresetId(p.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: isSelected
                          ? 'rgba(139, 92, 246, 0.16)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected
                          ? '1px solid rgba(139, 92, 246, 0.5)'
                          : '1px solid rgba(255, 255, 255, 0.07)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: `${p.badgeColor}22`,
                            color: p.badgeColor,
                            border: `1px solid ${p.badgeColor}44`,
                            textTransform: 'uppercase',
                          }}
                        >
                          {p.badge}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          {p.graph.nodes.length} nodes
                        </span>
                      </div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>
                        {p.name}
                      </h4>
                      <p
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          margin: 0,
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {p.concept}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Selected Preset Details */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  padding: 18,
                  overflowY: 'auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: `${activePreset.badgeColor}22`,
                      color: activePreset.badgeColor,
                      border: `1px solid ${activePreset.badgeColor}55`,
                      textTransform: 'uppercase',
                    }}
                  >
                    {activePreset.badge}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Recommended:</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#c084fc',
                        background: 'rgba(192, 132, 252, 0.12)',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {activePreset.recommendedAlgo}
                      {activePreset.recommendedParams?.beamWidth
                        ? ` (w=${activePreset.recommendedParams.beamWidth})`
                        : ''}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
                  {activePreset.name}
                </h3>

                {/* Algorithmic Concept */}
                <div style={{ marginBottom: 12 }}>
                  <h5 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>
                    Theoretical Concept
                  </h5>
                  <p style={{ fontSize: 12, color: 'var(--text-light, #e2e8f0)', margin: 0, lineHeight: 1.5 }}>
                    {activePreset.concept}
                  </p>
                </div>

                {/* Loophole & Pitfall Explanation */}
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <AlertCircle size={14} color="#f87171" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171', textTransform: 'uppercase' }}>
                      Algorithmic Loophole / Pitfall
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#fca5a5', margin: 0, lineHeight: 1.5 }}>
                    {activePreset.loopholeExplanation}
                  </p>
                </div>

                {/* Heuristic Values Table */}
                <div style={{ marginBottom: 16 }}>
                  <h5 style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                    Configured Heuristics h(N)
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {activePreset.graph.nodes.map((node) => {
                      const hVal = activePreset.heuristic[node] ?? 0
                      const isGoal = node === activePreset.graph.goal_node
                      const isStart = node === activePreset.graph.start_node
                      return (
                        <div
                          key={node}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: isGoal
                              ? 'rgba(16, 185, 129, 0.15)'
                              : isStart
                              ? 'rgba(59, 130, 246, 0.15)'
                              : 'rgba(255, 255, 255, 0.05)',
                            border: isGoal
                              ? '1px solid rgba(16, 185, 129, 0.4)'
                              : isStart
                              ? '1px solid rgba(59, 130, 246, 0.4)'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: 11,
                            fontFamily: 'var(--font-mono)',
                            color: isGoal ? '#34d399' : isStart ? '#60a5fa' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span style={{ fontWeight: 800 }}>{node}:</span>
                          <span>h={hVal}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Apply Button */}
                <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                  <button
                    onClick={() => handleApplyPreset(activePreset)}
                    style={{
                      width: '100%',
                      padding: '10px 18px',
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Load & Execute Preset Graph</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM GRAPH & HEURISTICS */}
          {activeTab === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Submode Switcher: Form vs Raw JSON */}
              <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => setCustomSubMode('form')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    background: customSubMode === 'form' ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: customSubMode === 'form' ? '1px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: customSubMode === 'form' ? '#ffffff' : 'var(--text-muted)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Visual Form Editor
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSubMode('json')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    background: customSubMode === 'json' ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: customSubMode === 'json' ? '1px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: customSubMode === 'json' ? '#ffffff' : 'var(--text-muted)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Raw JSON Editor
                </button>
              </div>

              {jsonError && (
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{jsonError}</span>
                </div>
              )}

              {customSubMode === 'json' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>
                    Graph &amp; Heuristic JSON (format: &#123; "graph": &#123; "nodes", "edges", "start_node", "goal_node" &#125;, "heuristic": &#123; ... &#125; &#125;):
                  </label>
                  <textarea
                    rows={12}
                    value={customJson}
                    onChange={(e) => setCustomJson(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 8,
                      color: '#ffffff',
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                      lineHeight: 1.5,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <button
                      onClick={handleApplyCustomJson}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Apply JSON Graph</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>

              {/* Form inputs for Nodes & Start/Goal */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Nodes (comma separated):
                  </label>
                  <input
                    type="text"
                    value={formNodes}
                    onChange={(e) => setFormNodes(e.target.value)}
                    placeholder="S, A, B, C, G"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 6,
                      color: '#ffffff',
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Start Node:
                  </label>
                  <input
                    type="text"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    placeholder="S"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 6,
                      color: '#ffffff',
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Goal Node:
                  </label>
                  <input
                    type="text"
                    value={formGoal}
                    onChange={(e) => setFormGoal(e.target.value)}
                    placeholder="G"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 6,
                      color: '#ffffff',
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>
              </div>

              {/* Form inputs for Directed Edges */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Directed Edges (one line per node, format: S -&gt; A, B):
                </label>
                <textarea
                  rows={4}
                  value={formEdgesText}
                  onChange={(e) => setFormEdgesText(e.target.value)}
                  placeholder="S -> A, B&#10;A -> C, D&#10;B -> G"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 6,
                    color: '#ffffff',
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {/* Heuristic values editor */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>
                    Node Heuristic Values h(N):
                  </label>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    Lower heuristic indicates estimated closer distance to goal (h(Goal) = 0)
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {formNodes
                    .split(',')
                    .map((n) => n.trim().toUpperCase())
                    .filter((n) => n.length > 0)
                    .map((node) => {
                      const isGoal = node === formGoal.trim().toUpperCase()
                      const val = formHeuristics[node] !== undefined ? formHeuristics[node] : isGoal ? 0 : 5
                      return (
                        <div
                          key={node}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '4px 8px',
                            borderRadius: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: isGoal ? '#34d399' : '#a855f7',
                            }}
                          >
                            h({node}):
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={999}
                            value={val}
                            onChange={(e) => {
                              const num = Math.max(0, parseFloat(e.target.value) || 0)
                              setFormHeuristics((prev) => ({ ...prev, [node]: num }))
                            }}
                            style={{
                              width: 50,
                              padding: '2px 4px',
                              background: 'rgba(0, 0, 0, 0.5)',
                              border: '1px solid rgba(139, 92, 246, 0.4)',
                              borderRadius: 4,
                              color: '#ffffff',
                              fontSize: 12,
                              fontFamily: 'var(--font-mono)',
                              textAlign: 'center',
                            }}
                          />
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  onClick={handleApplyFormGraph}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Apply Custom Graph & Heuristics</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

          {/* TAB 3: DETERMINISTIC GENERATOR */}
          {activeTab === 'generator' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: 6 }}>
                    Number of Nodes (3–12):
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="range"
                      min={3}
                      max={12}
                      value={genNodeCount}
                      onChange={(e) => setGenNodeCount(parseInt(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
                      {genNodeCount} nodes
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: 6 }}>
                    Max Branching Factor:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      value={genBranching}
                      onChange={(e) => setGenBranching(parseInt(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
                      {genBranching}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: 6 }}>
                  Random Seed:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    value={genSeed}
                    onChange={(e) => setGenSeed(parseInt(e.target.value) || 1)}
                    style={{
                      width: 120,
                      padding: '8px 10px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 6,
                      color: '#ffffff',
                      fontSize: 13,
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                  <button
                    onClick={() => setGenSeed(Math.floor(Math.random() * 999999))}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 6,
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Randomize Seed
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  borderRadius: 8,
                  padding: '12px 14px',
                }}
              >
                <p style={{ fontSize: 12, color: '#c084fc', margin: 0, lineHeight: 1.5 }}>
                  The deterministic generator produces a connected Directed Acyclic Graph (DAG) starting at S and ending at G. Heuristics h(N) are automatically computed along topological tiers to estimate path distance to G with h(G) = 0.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  onClick={handleGenerateGraph}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                  }}
                >
                  <Sparkles size={16} />
                  <span>Generate & Apply Graph</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InformedGraphConfigModal
