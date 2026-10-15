import React, { useState } from 'react'
import type { GraphData } from '../types'
import { X, Dices, Sparkles, AlertCircle } from 'lucide-react'

interface GraphConfigModalProps {
  isOpen: boolean
  onClose: () => void
  currentGraph: GraphData
  onGenerate: (params: any) => Promise<void>
  onApplyCustomGraph: (graph: GraphData) => void
}

const PRESETS: { name: string; description: string; graph: GraphData }[] = [
  {
    name: 'DFID Optimality Gap (DFID-N Suboptimal vs DFID-C Optimal)',
    description: 'Authoritative 8-node benchmark proving DFID-N returns a suboptimal 4-edge path (S→A→C→E→G) because CLOSED prunes B, whereas DFID-C reopens B and guarantees the optimal 3-edge path (S→D→B→G).',
    graph: {
      nodes: ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
      edges: {
        S: ['A', 'D'],
        A: ['C', 'F'],
        B: ['G'],
        C: ['E'],
        D: ['B'],
        E: ['G'],
        F: ['B'],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
    },
  },
  {
    name: 'DFID-N Incompleteness (Count Stagnation)',
    description: 'Demonstrates DFID-N failing to find an existing goal due to count stagnation (CLOSED blocks node C along the only viable path), while DFID-C reopens C and succeeds.',
    graph: {
      nodes: ['S', 'A', 'B', 'C', 'D', 'G'],
      edges: {
        S: ['A', 'D'],
        A: ['B'],
        B: ['C'],
        C: ['G'],
        D: ['C'],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
    },
  },
  {
    name: 'Reversible 2x2 Grid (Multi-Path Cycles)',
    description: 'A symmetric 4-node grid with bidirectional transitions testing cycle detection, DFS depth dives, and reciprocal edge rendering.',
    graph: {
      nodes: ['S', 'A', 'B', 'G'],
      edges: {
        S: ['A', 'B'],
        A: ['S', 'G'],
        B: ['S', 'G'],
        G: ['A', 'B'],
      },
      start_node: 'S',
      goal_node: 'G',
    },
  },
  {
    name: 'Authoritative Diamond (Multiple Paths)',
    description: 'Classic diamond graph comparing BFS (shortest path) vs DFS path exploration.',
    graph: {
      nodes: ['S', 'A', 'B', 'G'],
      edges: {
        S: ['A', 'B'],
        A: ['G'],
        B: ['G'],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
    },
  },
  {
    name: 'Cycle & Revisitation (DFID-N vs DFID-C)',
    description: 'Contains cycle and closed node that DFID-C reopens while DFID-N prunes.',
    graph: {
      nodes: ['S', 'A', 'B', 'C', 'G'],
      edges: {
        S: ['A', 'B'],
        A: ['C'],
        B: ['C', 'G'],
        C: [],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
    },
  },
  {
    name: 'Deep Search Tree (7 Nodes)',
    description: 'Binary branching tree testing depth exploration and backtracking.',
    graph: {
      nodes: ['S', 'A', 'B', 'C', 'D', 'E', 'G'],
      edges: {
        S: ['A', 'B'],
        A: ['C', 'D'],
        B: ['E', 'G'],
        C: [],
        D: [],
        E: [],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
    },
  },
  {
    name: 'Bidirectional Cycles (S ⇆ A)',
    description: 'Reversible state transitions testing loop avoidance via CLOSED.',
    graph: {
      nodes: ['S', 'A', 'B', 'G'],
      edges: {
        S: ['A'],
        A: ['B', 'S'],
        B: ['A', 'G'],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
    },
  },
  {
    name: 'Start Equals Goal (Edge Case)',
    description: 'Immediate termination with path [S].',
    graph: {
      nodes: ['S', 'A', 'B'],
      edges: {
        S: ['A'],
        A: ['B'],
        B: [],
      },
      start_node: 'S',
      goal_node: 'S',
    },
  },
  {
    name: 'Disconnected Unreachable Goal',
    description: 'Goal G resides in a disconnected component; proves exhaustive termination.',
    graph: {
      nodes: ['S', 'A', 'B', 'G'],
      edges: {
        S: ['A'],
        A: ['B'],
        B: [],
        G: [],
      },
      start_node: 'S',
      goal_node: 'G',
    },
  },
]

export const GraphConfigModal: React.FC<GraphConfigModalProps> = ({
  isOpen,
  onClose,
  currentGraph,
  onGenerate,
  onApplyCustomGraph,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'presets' | 'custom'>('generate')

  // Generator form state
  const [numNodes, setNumNodes] = useState(7)
  const [branchingFactor, setBranchingFactor] = useState(2)
  const [cycleProb, setCycleProb] = useState(0.2)
  const [disconnectedProb, setDisconnectedProb] = useState(0.0)
  const [seed, setSeed] = useState(42)

  // Custom JSON editor state
  const [customJson, setCustomJson] = useState(() => JSON.stringify(currentGraph, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 999999))
  }

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onGenerate({
      num_nodes: numNodes,
      branching_factor: branchingFactor,
      cycle_probability: cycleProb,
      disconnected_probability: disconnectedProb,
      seed,
    })
    onClose()
  }

  const handleCustomJsonApply = () => {
    try {
      const parsed = JSON.parse(customJson)
      if (!Array.isArray(parsed.nodes) || !parsed.edges || !parsed.start_node || !parsed.goal_node) {
        throw new Error("Invalid graph format: must contain 'nodes', 'edges', 'start_node', and 'goal_node'")
      }
      onApplyCustomGraph(parsed)
      setJsonError(null)
      onClose()
    } catch (err: any) {
      setJsonError(err.message || 'JSON Parsing failed')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
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
          maxWidth: 620,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} style={{ color: 'var(--accent-indigo)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>State Space Graph Configuration</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '0 20px' }}>
          {(['generate', 'presets', 'custom'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--accent-indigo)' : '2px solid transparent',
                color: activeTab === tab ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'generate' ? 'Deterministic Generator' : tab === 'presets' ? 'Handcrafted Presets' : 'Custom JSON'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {activeTab === 'generate' && (
            <form onSubmit={handleGenerateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Nodes */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Graph Size (Nodes):</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{numNodes} nodes</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={numNodes}
                  onChange={(e) => setNumNodes(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
              </div>

              {/* Branching Factor */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Branching Factor (Max Neighbours):</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>{branchingFactor}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={branchingFactor}
                  onChange={(e) => setBranchingFactor(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-indigo)' }}
                />
              </div>

              {/* Cycle Probability */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Cycle Probability:</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>{Math.round(cycleProb * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={cycleProb}
                  onChange={(e) => setCycleProb(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                />
              </div>

              {/* Disconnected Probability */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Disconnected Node Probability:</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>{Math.round(disconnectedProb * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.5}
                  step={0.05}
                  value={disconnectedProb}
                  onChange={(e) => setDisconnectedProb(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#94a3b8' }}
                />
              </div>

              {/* Seed */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Reproducible Random Seed:
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number"
                    className="input-field"
                    style={{ flex: 1 }}
                    value={seed}
                    onChange={(e) => setSeed(Number(e.target.value))}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleRandomizeSeed}>
                    <Dices size={16} />
                    <span>Randomize</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                Generate Deterministic Graph
              </button>
            </form>
          )}

          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PRESETS.map((preset) => (
                <div
                  key={preset.name}
                  onClick={() => {
                    onApplyCustomGraph(preset.graph)
                    onClose()
                  }}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#f8fafc', marginBottom: 4 }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {preset.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Define explicit node labels, neighbour adjacency lists, and start/goal (neighbours are explored in alphabetical order):
              </div>
              <textarea
                className="input-field"
                style={{
                  height: 240,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  lineHeight: 1.5,
                  resize: 'vertical',
                }}
                value={customJson}
                onChange={(e) => setCustomJson(e.target.value)}
              />
              {jsonError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f43f5e', fontSize: 12 }}>
                  <AlertCircle size={16} />
                  <span>{jsonError}</span>
                </div>
              )}
              <button className="btn btn-primary" onClick={handleCustomJsonApply}>
                Apply Custom Graph
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
