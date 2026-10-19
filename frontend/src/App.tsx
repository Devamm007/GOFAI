import React, { useEffect, useState, useRef } from 'react'
import confetti from 'canvas-confetti'
import type { GraphData, SearchRunResponse, TraceEvent } from './types'
import { GraphCanvas } from './components/GraphCanvas'
import { ControlBar } from './components/ControlBar'
import { OpenClosedPanel } from './components/OpenClosedPanel'
import { AnalysisArea } from './components/AnalysisArea'
import { StatsBanner } from './components/StatsBanner'
import { GraphConfigModal } from './components/GraphConfigModal'
import { HistoryModal } from './components/HistoryModal'
import { Network, Sliders, History, Zap, RotateCcw, Menu } from 'lucide-react'
import { apiUrl } from './utils/api'

const DEFAULT_GRAPH: GraphData = {
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
  metadata: { name: 'Default Search Tree' },
}

export interface AppProps {
  initialAlgorithm?: string
  onAlgorithmChange?: (algo: string) => void
  onBackToOverview?: () => void
  onOpenDrawer?: () => void
}

export const App: React.FC<AppProps> = ({
  initialAlgorithm,
  onAlgorithmChange,
  onBackToOverview,
  onOpenDrawer,
}) => {
  const [graph, setGraph] = useState<GraphData>(DEFAULT_GRAPH)
  const [algorithm, setAlgorithm] = useState<string>(initialAlgorithm || 'BFS')
  const [runResult, setRunResult] = useState<SearchRunResponse | null>(null)
  const [events, setEvents] = useState<TraceEvent[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // Modals
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)

  // Playback timer ref
  const timerRef = useRef<any>(null)

  // Auto-run search when graph or algorithm changes
  const runSearch = async (targetGraph: GraphData = graph, targetAlgo: string = algorithm) => {
    try {
      setIsLoading(true)
      setIsPlaying(false)
      const res = await fetch(apiUrl('/api/search/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph: targetGraph,
          algorithm: targetAlgo,
          persist: true,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Search run failed')
      }

      const data: SearchRunResponse = await res.json()
      setRunResult(data)
      setEvents(data.events || [])
      setCurrentStepIndex(0)
      setSelectedNodeId(null)
    } catch (err: any) {
      console.error('Search run error:', err)
      alert(`Error running search: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial run on mount
  useEffect(() => {
    runSearch(DEFAULT_GRAPH, initialAlgorithm || 'BFS')
  }, [])

  // Sync when initialAlgorithm changes from external navigation
  useEffect(() => {
    if (initialAlgorithm && initialAlgorithm !== algorithm) {
      setAlgorithm(initialAlgorithm)
      runSearch(graph, initialAlgorithm)
    }
  }, [initialAlgorithm])

  // When algorithm selector changes, run search
  const handleAlgorithmChange = (newAlgo: string) => {
    setAlgorithm(newAlgo)
    onAlgorithmChange?.(newAlgo)
    runSearch(graph, newAlgo)
  }

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      const delay = Math.max(100, Math.floor(1000 / speed))
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= events.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, delay)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, events.length, speed])

  const currentEvent = events[currentStepIndex] || null

  // Celebrate on goal reached
  useEffect(() => {
    if (currentEvent?.is_terminal && currentEvent?.terminal_status === 'SUCCESS') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
      })
    }
  }, [currentEvent])

  // Step controls
  const handleTogglePlay = () => {
    if (events.length === 0) return
    if (currentStepIndex >= events.length - 1) {
      setCurrentStepIndex(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handlePrevStep = () => {
    setIsPlaying(false)
    setCurrentStepIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextStep = () => {
    setIsPlaying(false)
    setCurrentStepIndex((prev) => Math.min(events.length - 1, prev + 1))
  }

  const handleRestart = () => {
    setIsPlaying(false)
    setCurrentStepIndex(0)
  }

  const handleJumpToEnd = () => {
    setIsPlaying(false)
    if (events.length > 0) {
      setCurrentStepIndex(events.length - 1)
    }
  }

  const handleSeek = (step: number) => {
    setIsPlaying(false)
    setCurrentStepIndex(step)
  }

  // Graph generator submit
  const handleGenerateGraph = async (params: any) => {
    try {
      setIsLoading(true)
      const res = await fetch(apiUrl('/api/graph/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!res.ok) throw new Error('Graph generation failed')
      const newGraph: GraphData = await res.json()
      setGraph(newGraph)
      await runSearch(newGraph, algorithm)
    } catch (err: any) {
      alert(`Graph Generation Error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Custom graph apply
  const handleApplyCustomGraph = async (newGraph: GraphData) => {
    setGraph(newGraph)
    await runSearch(newGraph, algorithm)
  }

  // Replay a past run from history
  const handleLoadRun = async (runId: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(apiUrl(`/api/runs/${runId}`))
      if (!res.ok) throw new Error('Failed to load past run')
      const data = await res.json()

      const loadedGraph: GraphData = {
        nodes: data.graph_snapshot.nodes,
        edges: data.graph_snapshot.edges,
        start_node: data.start_node,
        goal_node: data.goal_node,
      }
      setGraph(loadedGraph)
      setAlgorithm(data.algorithm)
      setRunResult(data)
      setEvents(data.events || [])
      setCurrentStepIndex(0)
      setSelectedNodeId(null)
    } catch (err: any) {
      alert(`Failed to replay run: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const algorithms = ['BFS', 'DFS', 'DFID-N', 'DFID-C']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Header Navbar */}
      <header
        style={{
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(10, 13, 20, 0.92)',
          backdropFilter: 'blur(12px)',
          zIndex: 30,
          flexShrink: 0,
        }}
      >
        {/* Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onOpenDrawer && (
            <button
              onClick={onOpenDrawer}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 8px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              title="Open Navigation Menu"
            >
              <Menu size={16} />
            </button>
          )}

          <div
            onClick={onBackToOverview}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: onBackToOverview ? 'pointer' : 'default',
            }}
            title={onBackToOverview ? 'Return to Lab Overview' : undefined}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(99, 102, 241, 0.45)',
              }}
            >
              <Network size={18} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.2px', color: '#ffffff', lineHeight: 1.2 }}>
                Code-Faithful Search Algorithm Visualizer
              </h1>
              <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', gap: 5, alignItems: 'center' }}>
                <span>IIT Madras AI SMPS T32026</span>
                <span>•</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Deterministic Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Selection Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0, 0, 0, 0.5)', padding: 3, borderRadius: 10 }}>
          {algorithms.map((algo) => {
            const isSelected = algorithm === algo
            return (
              <button
                key={algo}
                className="btn"
                onClick={() => handleAlgorithmChange(algo)}
                style={{
                  padding: '5px 13px',
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 700,
                  background: isSelected ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  boxShadow: isSelected ? '0 2px 10px rgba(99, 102, 241, 0.4)' : 'none',
                }}
              >
                {algo}
              </button>
            )
          })}
        </div>

        {/* Right Header Actions: Graph Config, History, Run */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setIsConfigOpen(true)} title="Graph Topology, Presets & Generator">
            <Sliders size={14} />
            <span>Graph Config</span>
          </button>

          <button className="btn btn-secondary" onClick={() => setIsHistoryOpen(true)} title="Browse & Replay Persisted Runs">
            <History size={14} />
            <span>History</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => runSearch(graph, algorithm)}
            disabled={isLoading}
            style={{ minWidth: 120 }}
          >
            {isLoading ? <RotateCcw className="animate-spin" size={14} /> : <Zap size={14} />}
            <span>{isLoading ? 'Running...' : `Run ${algorithm}`}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 14px', gap: 10, overflow: 'hidden' }}>
        {/* Status & Reconstructed Path Summary Bar */}
        <StatsBanner runResult={runResult} currentEvent={currentEvent} />

        {/* Center Main Region: Graph (Left) + OPEN/CLOSED Sidebar (Right) */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 10, minHeight: 0 }}>
          {/* LEFT: Graph Workspace Canvas & Dedicated Toolbar Directly Beneath */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', minHeight: 0 }}>
            {/* Generous State Space Canvas */}
            <div
              className="glass-panel"
              style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                minHeight: 0,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <GraphCanvas
                graph={graph}
                currentEvent={currentEvent}
                finalPath={runResult?.path}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            </div>

            {/* Execution Toolbar Directly Beneath the Graph */}
            <ControlBar
              currentStep={currentStepIndex}
              totalSteps={events.length}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              onRestart={handleRestart}
              onJumpToEnd={handleJumpToEnd}
              onSeek={handleSeek}
              speed={speed}
              setSpeed={setSpeed}
            />
          </div>

          {/* RIGHT SIDEBAR: OPEN & CLOSED Execution State Lists */}
          <div style={{ height: '100%', minHeight: 0 }}>
            <OpenClosedPanel
              currentEvent={currentEvent}
              onSelectNode={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
            />
          </div>
        </div>

        {/* LOWER AREA: Collapsible Pseudocode & Event Trace Log */}
        <AnalysisArea
          algorithm={algorithm}
          currentEvent={currentEvent}
          events={events}
          currentStepIndex={currentStepIndex}
          onSelectStep={setCurrentStepIndex}
        />
      </div>

      {/* Modals */}
      <GraphConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentGraph={graph}
        onGenerate={handleGenerateGraph}
        onApplyCustomGraph={handleApplyCustomGraph}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadRun={handleLoadRun}
      />
    </div>
  )
}
export default App
