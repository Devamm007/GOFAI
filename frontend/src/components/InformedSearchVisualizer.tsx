import React, { useEffect, useState, useRef } from 'react'
import confetti from 'canvas-confetti'
import type { GraphData, SearchRunResponse, TraceEvent } from '../types'
import { GraphCanvas } from './GraphCanvas'
import { ControlBar } from './ControlBar'
import { PseudocodePanel } from './PseudocodePanel'
import { OpenClosedPanel } from './OpenClosedPanel'
import {
  Sparkles,
  Menu,
  Layers,
  TrendingDown,
  RefreshCw,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react'
import { apiUrl } from '../utils/api'
import { InformedGraphConfigModal, INFORMED_PRESETS } from './InformedGraphConfigModal'

const DEFAULT_INFORMED_GRAPH: GraphData = {
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
  metadata: { name: 'Informed Search Tree' },
}

const DEFAULT_HEURISTICS: Record<string, number> = {
  S: 10,
  A: 6,
  B: 4,
  C: 8,
  D: 2,
  E: 5,
  G: 0,
}

const INFORMED_ALGORITHMS = [
  { id: 'Best-First-Search', label: 'Best-First', desc: 'Page 3, Lines 1–13' },
  { id: 'Beam-Search', label: 'Beam Search', desc: 'Page 3, Lines 1–10' },
  { id: 'Hill-Climbing', label: 'Hill Climbing', desc: 'Page 3, Lines 1–5' },
  { id: 'Variable-Neighbourhood-Descent', label: 'VND', desc: 'Page 3, Lines 1–6' },
  { id: 'Best-Neighbour-Search', label: 'Best Neighbour', desc: 'Page 3, Lines 1–7' },
  { id: 'Iterated-Hill-Climbing', label: 'Iterated HC', desc: 'Page 3, Lines 1–6' },
]

export interface InformedSearchVisualizerProps {
  initialAlgorithm?: string
  onAlgorithmChange?: (algo: string) => void
  onBackToOverview?: () => void
  onOpenDrawer?: () => void
}

export const InformedSearchVisualizer: React.FC<InformedSearchVisualizerProps> = ({
  initialAlgorithm,
  onAlgorithmChange,
  onBackToOverview,
  onOpenDrawer,
}) => {
  const initialPreset = INFORMED_PRESETS[0]
  const [graph, setGraph] = useState<GraphData>(initialPreset.graph)
  const [heuristic, setHeuristic] = useState<Record<string, number>>(initialPreset.heuristic)
  const [currentPresetName, setCurrentPresetName] = useState<string>(initialPreset.name)
  const [algorithm, setAlgorithm] = useState<string>(() => {
    if (initialAlgorithm && INFORMED_ALGORITHMS.some((a) => a.id === initialAlgorithm)) {
      return initialAlgorithm
    }
    return initialPreset.recommendedAlgo || 'Best-First-Search'
  })
  const [beamWidth, setBeamWidth] = useState<number>(initialPreset.recommendedParams?.beamWidth ?? 2)
  const [restarts, setRestarts] = useState<number>(initialPreset.recommendedParams?.restarts ?? 5)
  const [vndStrategy, setVndStrategy] = useState<string>('k-hop')

  const [runResult, setRunResult] = useState<SearchRunResponse | null>(null)
  const [events, setEvents] = useState<TraceEvent[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // Full Graph & Heuristic Configuration Modal
  const [isGraphModalOpen, setIsGraphModalOpen] = useState<boolean>(false)

  // Quick Heuristic editor modal
  const [isHeuristicModalOpen, setIsHeuristicModalOpen] = useState<boolean>(false)
  const [tempHeuristic, setTempHeuristic] = useState<Record<string, number>>(initialPreset.heuristic)
  const [isConceptExpanded, setIsConceptExpanded] = useState<boolean>(false)

  // Timer ref for step-by-step playback
  const timerRef = useRef<any>(null)
  const currentAlgoRef = useRef<string>(algorithm)
  const graphRef = useRef<GraphData>(graph)
  const heuristicRef = useRef<Record<string, number>>(heuristic)

  const handleApplyGraphAndHeuristic = (
    newGraph: GraphData,
    newHeuristic: Record<string, number>,
    recommendedAlgo?: string,
    recommendedParams?: { beamWidth?: number; restarts?: number }
  ) => {
    setGraph(newGraph)
    setHeuristic(newHeuristic)
    if (newGraph.metadata?.name) {
      setCurrentPresetName(newGraph.metadata.name)
    } else {
      setCurrentPresetName('Custom Graph')
    }

    let targetAlgo = algorithm
    if (recommendedAlgo && INFORMED_ALGORITHMS.some((a) => a.id === recommendedAlgo)) {
      targetAlgo = recommendedAlgo
      setAlgorithm(recommendedAlgo)
      currentAlgoRef.current = recommendedAlgo
      onAlgorithmChange?.(recommendedAlgo)
    }

    const targetBeam = recommendedParams?.beamWidth ?? beamWidth
    const targetRestarts = recommendedParams?.restarts ?? restarts
    if (recommendedParams?.beamWidth !== undefined) setBeamWidth(recommendedParams.beamWidth)
    if (recommendedParams?.restarts !== undefined) setRestarts(recommendedParams.restarts)

    runInformedSearch(newGraph, targetAlgo, newHeuristic, targetBeam, targetRestarts)
  }

  useEffect(() => {
    graphRef.current = graph
  }, [graph])

  useEffect(() => {
    heuristicRef.current = heuristic
  }, [heuristic])

  // Execute informed search against the backend API
  const runInformedSearch = async (
    targetGraph: GraphData = graph,
    targetAlgo: string = algorithm,
    targetHeuristic: Record<string, number> = heuristic,
    targetBeamWidth: number = beamWidth,
    targetRestarts: number = restarts,
    targetVndStrategy: string = vndStrategy
  ) => {
    try {
      setIsLoading(true)
      setIsPlaying(false)
      const res = await fetch(apiUrl('/api/search/informed/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph: targetGraph,
          algorithm: targetAlgo,
          heuristic: targetHeuristic,
          beam_width: targetBeamWidth,
          restarts: targetRestarts,
          vnd_strategy: targetVndStrategy,
          persist: false,
        }),
      })

      if (!res.ok) {
        let errMsg = 'Informed search run failed'
        try {
          const err = await res.json()
          if (Array.isArray(err.detail)) {
            errMsg = err.detail.map((e: any) => e.msg || e.detail || JSON.stringify(e)).join('; ')
          } else if (typeof err.detail === 'string') {
            errMsg = err.detail
          } else if (err.detail) {
            errMsg = JSON.stringify(err.detail)
          } else if (err.message) {
            errMsg = err.message
          }
        } catch {
          errMsg = `HTTP ${res.status}: ${res.statusText}`
        }
        throw new Error(errMsg)
      }

      const data: SearchRunResponse = await res.json()
      setRunResult(data)
      setEvents(data.events || [])
      setCurrentStepIndex(0)
      setSelectedNodeId(null)
    } catch (err: any) {
      console.error('Informed search run error:', err)
      alert(`Error running informed search: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial mount & sync with URL / drawer algorithm change
  useEffect(() => {
    const validTarget =
      initialAlgorithm && INFORMED_ALGORITHMS.some((a) => a.id === initialAlgorithm)
        ? initialAlgorithm
        : null

    if (validTarget && validTarget !== currentAlgoRef.current) {
      currentAlgoRef.current = validTarget
      setAlgorithm(validTarget)
      runInformedSearch(graphRef.current, validTarget, heuristicRef.current, beamWidth, restarts)
    } else if (!runResult) {
      runInformedSearch(DEFAULT_INFORMED_GRAPH, algorithm, DEFAULT_HEURISTICS, beamWidth, restarts)
    }
  }, [initialAlgorithm])

  const handleAlgorithmChange = (newAlgo: string) => {
    currentAlgoRef.current = newAlgo
    setAlgorithm(newAlgo)
    runInformedSearch(graph, newAlgo, heuristic, beamWidth, restarts)
    onAlgorithmChange?.(newAlgo)
  }

  // Playback timer loop
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
  }, [isPlaying, speed, events.length])

  // Fire celebratory confetti when goal is reached
  useEffect(() => {
    if (events.length > 0 && currentStepIndex === events.length - 1) {
      const lastEvent = events[events.length - 1]
      if (
        lastEvent?.is_terminal &&
        (lastEvent?.terminal_status === 'SUCCESS' || lastEvent?.terminal_reason === 'GOAL_FOUND')
      ) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#a855f7', '#06b6d4', '#10b981'],
        })
      }
    }
  }, [currentStepIndex, events])

  const currentEvent: TraceEvent | null = events[currentStepIndex] || null

  const handleNext = () => {
    if (currentStepIndex < events.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStepIndex(0)
  }

  const handleSeek = (step: number) => {
    setIsPlaying(false)
    setCurrentStepIndex(step)
  }

  const isLocalSearch = [
    'Hill-Climbing',
    'Variable-Neighbourhood-Descent',
    'Best-Neighbour-Search',
    'Iterated-Hill-Climbing',
  ].includes(algorithm)

  const isBeamSearch = algorithm === 'Beam-Search'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        width: '100%',
        minHeight: 0,
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Top Compact Navigation Toolbar */}
      <header
        style={{
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(10, 13, 20, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: 30,
          flexShrink: 0,
          gap: 10,
        }}
      >
        {/* Left: Hamburger + Brand + Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onOpenDrawer && (
            <button
              onClick={onOpenDrawer}
              aria-label="Open application navigation menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 8px',
                borderRadius: 7,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
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
              gap: 8,
              cursor: onBackToOverview ? 'pointer' : 'default',
            }}
            title={onBackToOverview ? 'Return to Lab Overview' : undefined}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.35)',
              }}
            >
              <Sparkles size={16} color="#ffffff" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <span
                style={{
                  fontWeight: 700,
                  color: '#ffffff',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.2px',
                }}
              >
                AI Search Lab
              </span>
              <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>/</span>
              <span style={{ color: 'var(--accent-purple)', fontWeight: 600, fontSize: 12 }}>
                Week 3: Informed Search
              </span>
            </div>
          </div>
        </div>

        {/* Center: Algorithm Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.45)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            gap: 2,
            overflowX: 'auto',
          }}
        >
          {INFORMED_ALGORITHMS.map((algo) => {
            const isActive = algorithm === algo.id
            return (
              <button
                key={algo.id}
                onClick={() => handleAlgorithmChange(algo.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'var(--accent-purple)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 0 10px rgba(139, 92, 246, 0.4)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-muted)'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {algo.label}
              </button>
            )
          })}
        </div>

        {/* Right: Algorithm-specific inputs & Heuristic modal button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isBeamSearch && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#c084fc' }}>Beam w:</span>
              <input
                type="number"
                min={1}
                max={10}
                value={beamWidth}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                  setBeamWidth(val)
                  runInformedSearch(graph, algorithm, heuristic, val, restarts)
                }}
                style={{
                  width: 42,
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: 4,
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '2px 4px',
                }}
              />
            </div>
          )}

          {algorithm === 'Iterated-Hill-Climbing' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#c084fc' }}>Restarts N:</span>
              <input
                type="number"
                min={1}
                max={20}
                value={restarts}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                  setRestarts(val)
                  runInformedSearch(graph, algorithm, heuristic, beamWidth, val)
                }}
                style={{
                  width: 42,
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: 4,
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '2px 4px',
                }}
              />
            </div>
          )}

          {/* VND Strategy Selector */}
          {algorithm === 'Variable-Neighbourhood-Descent' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>Neighbourhoods:</span>
              <select
                value={vndStrategy}
                onChange={(e) => {
                  const val = e.target.value
                  setVndStrategy(val)
                  runInformedSearch(graph, algorithm, heuristic, beamWidth, restarts, val)
                }}
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: 4,
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 4px',
                }}
              >
                <option value="k-hop" style={{ background: '#0d131f' }}>1-Hop + 2-Hop + 3-Hop</option>
                <option value="2-hop" style={{ background: '#0d131f' }}>1-Hop + 2-Hop Jumps</option>
                <option value="connectivity" style={{ background: '#0d131f' }}>Forward + Reverse + Undirected</option>
              </select>
            </div>
          )}

          {/* Configure Graph & Presets Modal Button */}
          <button
            onClick={() => setIsGraphModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.45)',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.32)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'
            }}
            title="Configure Graph, Heuristics, or select Educational Presets"
          >
            <Sparkles size={13} style={{ color: '#c084fc' }} />
            <span>Graph &amp; Presets</span>
            <span
              style={{
                fontSize: 10,
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '1px 5px',
                borderRadius: 4,
                color: '#e9d5ff',
                maxWidth: 120,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentPresetName}
            </span>
          </button>

          {/* Edit Heuristics button */}
          <button
            onClick={() => {
              setTempHeuristic({ ...heuristic })
              setIsHeuristicModalOpen(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#d8b4fe',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.22)'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.12)'
              e.currentTarget.style.color = '#d8b4fe'
            }}
            title="Edit heuristic values h(N) for nodes"
          >
            <Edit3 size={13} />
            <span>Edit h(N)</span>
          </button>

          {/* Re-run button */}
          <button
            onClick={() => runInformedSearch()}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 10px rgba(124, 58, 237, 0.3)',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Running...' : 'Re-Run'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left / Center View: Graph Canvas & Control Bar */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {/* Static Non-Overlapping Graph & Preset Sub-header Bar (Standard Flex Flow) */}
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 16px',
              background: 'rgba(15, 23, 42, 0.88)',
              borderBottom: '1px solid var(--border-subtle)',
              gap: 12,
              flexWrap: 'wrap',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} style={{ color: '#c084fc' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>
                  {graph.metadata?.name || currentPresetName}
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Start: <strong style={{ color: '#60a5fa' }}>{graph.start_node}</strong> | Goal:{' '}
                <strong style={{ color: '#34d399' }}>{graph.goal_node}</strong> ({graph.nodes.length} nodes)
              </span>
              <button
                onClick={() => setIsGraphModalOpen(true)}
                style={{
                  background: 'rgba(139, 92, 246, 0.25)',
                  border: '1px solid rgba(139, 92, 246, 0.45)',
                  color: '#d8b4fe',
                  borderRadius: 5,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Switch Preset / Custom Graph
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {currentEvent?.current_node && (
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  Current State: <strong style={{ color: '#c084fc', fontFamily: 'var(--font-mono)' }}>{currentEvent.current_node}</strong>
                  {heuristic[currentEvent.current_node] !== undefined && ` (h=${heuristic[currentEvent.current_node]})`}
                </span>
              )}
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <GraphCanvas
              graph={graph}
              heuristic={heuristic}
              currentEvent={currentEvent}
              finalPath={runResult?.path || null}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          </div>

          {/* Playback Control Bar */}
          <div style={{ flexShrink: 0 }}>
            <ControlBar
              isPlaying={isPlaying}
              currentStep={currentStepIndex}
              totalSteps={events.length}
              speed={speed}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onNextStep={handleNext}
              onPrevStep={handlePrev}
              onRestart={handleReset}
              onJumpToEnd={() => setCurrentStepIndex(Math.max(0, events.length - 1))}
              onSeek={handleSeek}
              setSpeed={setSpeed}
            />
          </div>
        </div>

        {/* Right View: Pseudocode & Data Structures */}
        <div
          style={{
            width: 'clamp(320px, 28vw, 440px)',
            borderLeft: '1px solid var(--border-subtle)',
            background: 'rgba(10, 13, 20, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Top Half: Pseudocode Panel */}
          <div style={{ flex: 1, minHeight: 0, borderBottom: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <PseudocodePanel algorithm={algorithm} currentEvent={currentEvent} />
          </div>

          {/* Bottom Half: State Inspection Panel */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* If Best-First Search, display full OPEN/CLOSED triple lists */}
            {algorithm === 'Best-First-Search' && (
              <OpenClosedPanel currentEvent={currentEvent} />
            )}

            {/* If Beam Search, display layer candidates and retained nodes */}
            {/* If Beam Search, display layer candidates, successors, and retained nodes */}
            {isBeamSearch && (
              <div
                className="glass-panel"
                style={{
                  padding: 14,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#38bdf8' }}>
                    <Layers size={16} />
                    <span>BEAM SEARCH LAYER (w = {beamWidth})</span>
                  </div>
                  <span
                    className="pill-tag"
                    style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                  >
                    Depth Layer
                  </span>
                </div>

                {/* Current Inspected Node & Best-Ever Card */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 8,
                  }}
                >
                  <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>Current Node (N / X):</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
                      {currentEvent?.current_node || '—'}
                      {currentEvent?.current_node && heuristic[currentEvent.current_node] !== undefined && (
                        <span style={{ fontSize: 11, color: '#38bdf8', marginLeft: 6, fontWeight: 700 }}>
                          h = {heuristic[currentEvent.current_node]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>bestEver Node:</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                      {currentEvent?.current_parent || (currentEvent?.current_node ? currentEvent.current_node : '—')}
                      {currentEvent?.current_parent && heuristic[currentEvent.current_parent] !== undefined && (
                        <span style={{ fontSize: 11, color: '#10b981', marginLeft: 6, fontWeight: 700 }}>
                          h = {heuristic[currentEvent.current_parent]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Move-Gen Neighbours for the inspected node or layer */}
                {currentEvent?.raw_neighbours && currentEvent.raw_neighbours.length > 0 && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                      {currentEvent.event_type === 'MOVE_GEN_NODE'
                        ? `Move-Gen('${currentEvent.current_node}') Successors:`
                        : 'Combined Layer Neighbours:'}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {currentEvent.raw_neighbours.map((nbr: string, i: number) => {
                        const hVal = heuristic[nbr] !== undefined ? heuristic[nbr] : '?'
                        const isRetained = currentEvent.filtered_nodes?.includes(nbr) || (currentEvent.open_after && currentEvent.open_after.includes(nbr))
                        return (
                          <div
                            key={i}
                            style={{
                              padding: '3px 8px',
                              borderRadius: 4,
                              background: isRetained ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                              border: isRetained ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid var(--border-subtle)',
                              color: isRetained ? '#ffffff' : 'var(--text-muted)',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {nbr} <span style={{ color: isRetained ? '#38bdf8' : '#94a3b8', fontSize: 10 }}>h={hVal}</span>
                            {isRetained && ' ✓'}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Retained Candidates (head OPEN, at most w) */}
                <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Active Beam OPEN Layer (at most w = {beamWidth}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {currentEvent?.open_after && currentEvent.open_after.length > 0 ? (
                      currentEvent.open_after.map((item: any, idx: number) => {
                        const nodeLabel = typeof item === 'string' ? item : item?.[0]
                        const hVal = heuristic[nodeLabel] !== undefined ? heuristic[nodeLabel] : '?'
                        const isHead = idx === 0
                        return (
                          <div
                            key={idx}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              background: isHead ? 'rgba(56, 189, 248, 0.3)' : 'rgba(56, 189, 248, 0.15)',
                              border: isHead ? '1px solid rgba(56, 189, 248, 0.7)' : '1px solid rgba(56, 189, 248, 0.3)',
                              color: '#ffffff',
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {nodeLabel} <span style={{ color: '#38bdf8', fontSize: 10 }}>h={hVal}</span>
                            {isHead && ' (Head)'}
                          </div>
                        )
                      })
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Empty layer</span>
                    )}
                  </div>
                </div>

                {/* Event Summary */}
                <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Current Inspection:
                  </div>
                  <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.5 }}>
                    {currentEvent?.description || 'Awaiting search initialization'}
                  </div>
                </div>

                {/* Terminal Status / Reason */}
                {currentEvent?.is_terminal && (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 6,
                      background:
                        currentEvent.terminal_status === 'SUCCESS'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                      border: `1px solid ${
                        currentEvent.terminal_status === 'SUCCESS'
                          ? 'rgba(16, 185, 129, 0.4)'
                          : 'rgba(245, 158, 11, 0.4)'
                      }`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {currentEvent.terminal_status === 'SUCCESS' ? (
                        <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                      ) : (
                        <AlertCircle size={15} style={{ color: '#f59e0b' }} />
                      )}
                      <span style={{ fontWeight: 700, fontSize: 12, color: '#ffffff' }}>
                        {currentEvent.terminal_reason || 'TERMINATED'}
                      </span>
                    </div>
                    {currentEvent.path && currentEvent.path.length > 0 && (
                      <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4, fontFamily: 'monospace' }}>
                        Path: {currentEvent.path.join(' → ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* If Local Search, display Local Search Progress Card */}
            {isLocalSearch && (
              <div
                className="glass-panel"
                style={{
                  padding: 14,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#f59e0b' }}>
                    <TrendingDown size={16} />
                    <span>
                      {algorithm === 'Iterated-Hill-Climbing'
                        ? 'ITERATED HC RESTARTS'
                        : algorithm === 'Variable-Neighbourhood-Descent'
                        ? 'VARIABLE NEIGHBOURHOOD'
                        : algorithm === 'Best-Neighbour-Search'
                        ? 'BEST NEIGHBOUR WALK'
                        : 'LOCAL SEARCH OPTIMIZATION'}
                    </span>
                  </div>
                  <span
                    className="pill-tag"
                    style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                  >
                    State Optimization
                  </span>
                </div>

                {/* Conceptual Notice Banner */}
                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    fontSize: 11,
                    color: '#fef3c7',
                    lineHeight: 1.4,
                  }}
                >
                  <strong>Local Search Concept:</strong> Optimizes for the best individual state configuration ({algorithm === 'Iterated-Hill-Climbing' || algorithm === 'Variable-Neighbourhood-Descent' ? 'bestNode' : 'bestEver'}). No tree is maintained and no path is reconstructed.
                </div>

                {/* Iterated HC Specific: Restarts Tracker */}
                {algorithm === 'Iterated-Hill-Climbing' && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                        Restart Iteration Progress:
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8' }}>
                        Restart {currentEvent?.iteration || 1} of {restarts}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 8, borderRadius: 4 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Candidate Seed:</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
                          {currentEvent?.current_node || '—'}
                          {currentEvent?.current_node && heuristic[currentEvent.current_node] !== undefined && (
                            <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>
                              h={heuristic[currentEvent.current_node]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: 8, borderRadius: 4 }}>
                        <div style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700 }}>Champion bestNode:</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                          {currentEvent?.current_parent || (currentEvent?.current_node ? currentEvent.current_node : '—')}
                          {currentEvent?.current_parent && heuristic[currentEvent.current_parent] !== undefined && (
                            <span style={{ fontSize: 10, color: '#34d399', marginLeft: 4 }}>
                              h={heuristic[currentEvent.current_parent]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VND Specific: Neighbourhood Structures Pipeline */}
                {algorithm === 'Variable-Neighbourhood-Descent' && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                        Active Neighbourhood Pipeline:
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8' }}>
                        Structure {currentEvent?.iteration || 1}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: currentEvent?.event_type === 'LOCAL_OPTIMUM_TRAPPED' ? 8 : 0 }}>
                      {(vndStrategy === '2-hop'
                        ? ['MoveGen₁ (1-Hop)', 'MoveGen₂ (2-Hop Jumps)']
                        : vndStrategy === 'connectivity'
                        ? ['MoveGen₁ (Forward)', 'MoveGen₂ (Reverse)', 'MoveGen₃ (Undirected)']
                        : ['MoveGen₁ (1-Hop)', 'MoveGen₂ (2-Hop Jumps)', 'MoveGen₃ (3-Hop Leaps)']
                      ).map((mgName, idx) => {
                        const activeIdx = (currentEvent?.iteration || 1) - 1
                        const isActive = idx === activeIdx
                        const isDone = idx < activeIdx
                        return (
                          <div
                            key={mgName}
                            style={{
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              background: isActive
                                ? 'rgba(56, 189, 248, 0.25)'
                                : isDone
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(255, 255, 255, 0.05)',
                              border: isActive
                                ? '1px solid #38bdf8'
                                : isDone
                                ? '1px solid rgba(16, 185, 129, 0.4)'
                                : '1px solid var(--border-subtle)',
                              color: isActive ? '#ffffff' : isDone ? '#34d399' : 'var(--text-dim)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            {isDone && '✓ '}
                            {isActive && '▶ '}
                            {mgName}
                          </div>
                        )
                      })}
                    </div>

                    {currentEvent?.event_type === 'LOCAL_OPTIMUM_TRAPPED' && (
                      <div
                        style={{
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          padding: '6px 10px',
                          borderRadius: 4,
                          fontSize: 11,
                          color: '#fef3c7',
                          lineHeight: 1.4,
                        }}
                      >
                        <strong>Local Trap Stagnation:</strong> Trapped at local minimum under current MoveGen. VND advances to <code>tail MoveGenList</code> to search a wider neighbourhood!
                      </div>
                    )}
                  </div>
                )}

                {/* Standard Local Search: Current vs Best Node Card */}
                {algorithm !== 'Iterated-Hill-Climbing' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 8,
                    }}
                  >
                    <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>Current State (N):</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
                        {currentEvent?.current_node || '—'}
                        {currentEvent?.current_node && heuristic[currentEvent.current_node] !== undefined && (
                          <span style={{ fontSize: 11, color: '#f59e0b', marginLeft: 6, fontWeight: 700 }}>
                            h = {heuristic[currentEvent.current_node]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>
                        {algorithm === 'Variable-Neighbourhood-Descent' ? 'bestNode State:' : 'bestEver State:'}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                        {currentEvent?.current_parent || (currentEvent?.current_node ? currentEvent.current_node : '—')}
                        {currentEvent?.current_parent && heuristic[currentEvent.current_parent] !== undefined && (
                          <span style={{ fontSize: 11, color: '#34d399', marginLeft: 6, fontWeight: 700 }}>
                            h = {heuristic[currentEvent.current_parent]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Evaluated Neighbours in Step */}
                {currentEvent?.raw_neighbours && currentEvent.raw_neighbours.length > 0 && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                      Generated Neighbours (sort_h MoveGen):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {currentEvent.raw_neighbours.map((nbr: string, i: number) => {
                        const hVal = heuristic[nbr] !== undefined ? heuristic[nbr] : '?'
                        const isBestChoice = i === 0
                        return (
                          <div
                            key={i}
                            style={{
                              padding: '3px 8px',
                              borderRadius: 4,
                              background: isBestChoice ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                              border: isBestChoice ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-subtle)',
                              color: isBestChoice ? '#ffffff' : 'var(--text-muted)',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {nbr} <span style={{ color: isBestChoice ? '#34d399' : '#94a3b8', fontSize: 10 }}>h={hVal}</span>
                            {isBestChoice && ' ★'}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Step Event Description */}
                <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                    Step Evaluation:
                  </div>
                  <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.5 }}>
                    {currentEvent?.description || 'Awaiting algorithm initiation'}
                  </div>
                </div>

                {/* Terminal Status / Reason */}
                {currentEvent?.is_terminal && (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 6,
                      background:
                        currentEvent.terminal_status === 'SUCCESS'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                      border: `1px solid ${
                        currentEvent.terminal_status === 'SUCCESS'
                          ? 'rgba(16, 185, 129, 0.4)'
                          : 'rgba(245, 158, 11, 0.4)'
                      }`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {currentEvent.terminal_status === 'SUCCESS' ? (
                        <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                      ) : (
                        <AlertCircle size={15} style={{ color: '#f59e0b' }} />
                      )}
                      <span style={{ fontWeight: 700, fontSize: 12, color: '#ffffff' }}>
                        {currentEvent.terminal_reason || 'TERMINATED'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
                      Returned Terminal State Configuration:{' '}
                      <strong style={{ color: '#10b981' }}>
                        {currentEvent.current_node || currentEvent.current_parent || '—'}
                      </strong>{' '}
                      (h = {heuristic[currentEvent.current_node || ''] ?? heuristic[currentEvent.current_parent || ''] ?? '?'})
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, fontStyle: 'italic' }}>
                      No path reconstructed: Local search terminates at the optimum candidate state.
                    </div>
                  </div>
                )}

                {/* Educational Concept Guide */}
                <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                  <button
                    onClick={() => setIsConceptExpanded(!isConceptExpanded)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: isConceptExpanded ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      border: isConceptExpanded ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid var(--border-subtle)',
                      color: isConceptExpanded ? '#38bdf8' : 'var(--text-muted)',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BookOpen size={14} />
                      How Candidate Solutions are Produced in Real Problems
                    </span>
                    {isConceptExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isConceptExpanded && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 10,
                        borderRadius: 6,
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        fontSize: 11,
                        color: '#cbd5e1',
                        lineHeight: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div>
                        <strong style={{ color: '#f59e0b' }}>1. Traveling Salesperson (TSP):</strong>
                        <div style={{ color: '#94a3b8', fontSize: 10 }}>
                          A candidate state is a complete tour permutation π ∈ Sₙ. A random candidate shuffles all cities [c₀, c₁, ..., cₙ₋₁]. Local moves perform 2-opt edge swaps or city reinsertions.
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#38bdf8' }}>2. N-Queens Problem:</strong>
                        <div style={{ color: '#94a3b8', fontSize: 10 }}>
                          A candidate state assigns one queen per column [r₀, r₁, ..., rₙ₋₁]. A random restart places queens on uniformly random rows, or generates a random row permutation without row collisions.
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#a855f7' }}>3. Explicit State Graphs (Lecture Benchmark):</strong>
                        <div style={{ color: '#94a3b8', fontSize: 10 }}>
                          Random candidate generation uniformly samples a vertex s ∈ V using pseudo-random selection (random.choice(nodes)).
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#10b981' }}>4. Why No Path is Reconstructed:</strong>
                        <div style={{ color: '#94a3b8', fontSize: 10 }}>
                          Local search moves occur in configuration/solution space, not physical movement across real-world paths. The algorithm returns the best state configuration found.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Heuristic Editor Modal */}
      {isHeuristicModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: 'min(440px, 90vw)',
              background: '#0d131f',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit3 size={18} style={{ color: 'var(--accent-purple)' }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Edit Node Heuristic Values h(N)
                </h3>
              </div>
              <button
                onClick={() => setIsHeuristicModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Define the estimated cost-to-goal for each node in the graph. Ties are broken
              alphabetically (Page 2).
            </p>

            {/* Grid of Node inputs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                gap: 10,
                maxHeight: 240,
                overflowY: 'auto',
                marginBottom: 18,
                padding: 4,
              }}
            >
              {graph.nodes.map((n) => (
                <div
                  key={n}
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#c084fc' }}>
                    Node {n} {n === graph.goal_node && '★'}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={tempHeuristic[n] !== undefined ? tempHeuristic[n] : 0}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0)
                      setTempHeuristic((prev) => ({ ...prev, [n]: val }))
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 4,
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '4px 6px',
                      textAlign: 'center',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Save & Cancel Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setIsHeuristicModalOpen(false)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setHeuristic(tempHeuristic)
                  setIsHeuristicModalOpen(false)
                  runInformedSearch(graph, algorithm, tempHeuristic, beamWidth, restarts)
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-purple)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
                }}
              >
                Apply & Re-Run
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informed Graph Configuration & Presets Modal */}
      <InformedGraphConfigModal
        isOpen={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
        currentGraph={graph}
        currentHeuristic={heuristic}
        onApplyGraphAndHeuristic={handleApplyGraphAndHeuristic}
      />
    </div>
  )
}

export default InformedSearchVisualizer
