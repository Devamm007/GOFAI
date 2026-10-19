import React, { useEffect, useState, useRef, useMemo } from 'react'
import confetti from 'canvas-confetti'
import type { TSPResult, TSPTraceEvent } from '../types'
import { PseudocodePanel } from './PseudocodePanel'
import { ControlBar } from './ControlBar'
import {
  Compass,
  Menu,
  CheckCircle2,
  Table,
  RefreshCw,
  GitMerge,
  X,
  Sparkles,
} from 'lucide-react'
import { apiUrl } from '../utils/api'
import { TSPConfigModal } from './TSPConfigModal'
import { TSP_PRESETS, type TSPPreset } from '../data/tspPresets'

const DEFAULT_TSP_CITIES = ['A', 'B', 'C', 'D', 'E']

const DEFAULT_TSP_COSTS: Record<string, Record<string, number>> = {
  A: { B: 12, C: 10, D: 19, E: 8 },
  B: { A: 12, C: 3, D: 7, E: 20 },
  C: { A: 10, B: 3, D: 6, E: 14 },
  D: { A: 19, B: 7, C: 6, E: 11 },
  E: { A: 8, B: 20, C: 14, D: 11 },
}

const TSP_ALGORITHMS = [
  { id: 'Nearest-Neighbour-Heuristic', label: 'Nearest Neighbour', desc: 'Greedy city hop' },
  { id: 'Greedy-Heuristic', label: 'Greedy Heuristic', desc: 'Edge-cost sorting' },
  { id: 'Savings-Heuristic', label: 'Savings (Clarke-Wright)', desc: 'Base subtour merges' },
]

export interface TSPVisualizerProps {
  initialAlgorithm?: string
  onAlgorithmChange?: (algo: string) => void
  onBackToOverview?: () => void
  onOpenDrawer?: () => void
}

export const TSPVisualizer: React.FC<TSPVisualizerProps> = ({
  initialAlgorithm,
  onAlgorithmChange,
  onBackToOverview,
  onOpenDrawer,
}) => {
  const initialPreset = TSP_PRESETS[0]
  const [cities, setCities] = useState<string[]>(initialPreset.cities)
  const [costs, setCosts] = useState<Record<string, Record<string, number>>>(initialPreset.costs)
  const [currentPresetName, setCurrentPresetName] = useState<string>(initialPreset.name)
  const [algorithm, setAlgorithm] = useState<string>(() => {
    if (initialAlgorithm && TSP_ALGORITHMS.some((a) => a.id === initialAlgorithm)) {
      return initialAlgorithm
    }
    return 'Savings-Heuristic'
  })
  const [startCity, setStartCity] = useState<string>(initialPreset.defaultStartCity || 'A')
  const [baseCity, setBaseCity] = useState<string>(initialPreset.defaultBaseCity || 'A')

  const [runResult, setRunResult] = useState<TSPResult | null>(null)
  const [events, setEvents] = useState<TSPTraceEvent[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Benchmark Presets & Comparison Modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false)

  // Cost matrix editor modal
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState<boolean>(false)
  const [tempCosts, setTempCosts] = useState<Record<string, Record<string, number>>>(initialPreset.costs)

  const timerRef = useRef<any>(null)
  const currentAlgoRef = useRef<string>(algorithm)

  const handleApplyPreset = (preset: TSPPreset) => {
    setCities(preset.cities)
    setCosts(preset.costs)
    setCurrentPresetName(preset.name)
    const newStart = preset.defaultStartCity || preset.cities[0]
    const newBase = preset.defaultBaseCity || preset.cities[0]
    setStartCity(newStart)
    setBaseCity(newBase)
    runTSP(preset.cities, preset.costs, algorithm, newStart, newBase)
  }

  const handleApplyCosts = (newCities: string[], newCosts: Record<string, Record<string, number>>) => {
    setCities(newCities)
    setCosts(newCosts)
    setCurrentPresetName('Custom Matrix')
    runTSP(newCities, newCosts, algorithm, startCity, baseCity)
  }

  const handleSelectAlgorithmToTrace = (newAlgo: string) => {
    setAlgorithm(newAlgo)
    currentAlgoRef.current = newAlgo
    onAlgorithmChange?.(newAlgo)
    runTSP(cities, costs, newAlgo, startCity, baseCity)
  }

  // Geometric 2D placement of cities on a circular layout for clean SVG rendering
  const cityPositions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {}
    const n = cities.length
    const radius = 170
    const centerX = 260
    const centerY = 240

    cities.forEach((city, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2
      map[city] = {
        x: Math.round(centerX + radius * Math.cos(angle)),
        y: Math.round(centerY + radius * Math.sin(angle)),
      }
    })
    return map
  }, [cities])

  // Call the backend /api/search/tsp/run endpoint
  const runTSP = async (
    targetCities: string[] = cities,
    targetCosts: Record<string, Record<string, number>> = costs,
    targetAlgo: string = algorithm,
    targetStart: string = startCity,
    targetBase: string = baseCity
  ) => {
    try {
      setIsLoading(true)
      setIsPlaying(false)

      const payload: any = {
        cities: targetCities,
        costs: targetCosts,
        algorithm: targetAlgo,
      }
      if (targetAlgo === 'Nearest-Neighbour-Heuristic') {
        payload.start_city = targetStart
      } else if (targetAlgo === 'Savings-Heuristic') {
        payload.base_city = targetBase
      }

      const res = await fetch(apiUrl('/api/search/tsp/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'TSP run failed')
      }

      const data: TSPResult = await res.json()
      setRunResult(data)
      setEvents(data.events || [])
      setCurrentStepIndex(0)
    } catch (err: any) {
      console.error('TSP run error:', err)
      alert(`Error running TSP heuristic: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial run and sync when initialAlgorithm changes
  useEffect(() => {
    const validTarget =
      initialAlgorithm && TSP_ALGORITHMS.some((a) => a.id === initialAlgorithm)
        ? initialAlgorithm
        : null

    if (validTarget && validTarget !== currentAlgoRef.current) {
      currentAlgoRef.current = validTarget
      setAlgorithm(validTarget)
      runTSP(cities, costs, validTarget, startCity, baseCity)
    } else if (!runResult) {
      runTSP(DEFAULT_TSP_CITIES, DEFAULT_TSP_COSTS, algorithm, startCity, baseCity)
    }
  }, [initialAlgorithm])

  const handleAlgorithmChange = (newAlgo: string) => {
    currentAlgoRef.current = newAlgo
    setAlgorithm(newAlgo)
    runTSP(cities, costs, newAlgo, startCity, baseCity)
    onAlgorithmChange?.(newAlgo)
  }

  // Playback timer
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

  // Confetti on final tour completion
  useEffect(() => {
    if (events.length > 0 && currentStepIndex === events.length - 1) {
      const lastEvent = events[events.length - 1]
      if (lastEvent?.is_terminal) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#ec4899', '#f43f5e', '#8b5cf6'],
        })
      }
    }
  }, [currentStepIndex, events])

  const currentEvent: TSPTraceEvent | null = events[currentStepIndex] || null

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

  // Active tour and candidate edges from current event
  const { acceptedEdgesSet, candidateEdge, activeCity } = useMemo(() => {
    const acceptedEdgesSet = new Set<string>()

    // If current tour exists, extract edges
    if (currentEvent?.current_tour && currentEvent.current_tour.length > 1) {
      const tour = currentEvent.current_tour
      for (let i = 0; i < tour.length - 1; i++) {
        const u = tour[i]
        const v = tour[i + 1]
        acceptedEdgesSet.add(`${u}-${v}`)
        acceptedEdgesSet.add(`${v}-${u}`)
      }
    }

    // If sub-tours exist (Savings Heuristic), extract their edges
    if (currentEvent?.sub_tours) {
      for (const st of currentEvent.sub_tours) {
        for (let i = 0; i < st.length - 1; i++) {
          const u = st[i]
          const v = st[i + 1]
          acceptedEdgesSet.add(`${u}-${v}`)
          acceptedEdgesSet.add(`${v}-${u}`)
        }
      }
    }

    let candidateEdge: [string, string] | null = null
    if (currentEvent?.selected_edge) {
      const se = currentEvent.selected_edge
      if (Array.isArray(se) && se.length >= 2) {
        candidateEdge = [se[0], se[1]]
      }
    }

    const activeCity = currentEvent?.current_city || null

    return { acceptedEdgesSet, candidateEdge, activeCity }
  }, [currentEvent])

  // Unique undirected edges for background rendering
  const allEdges = useMemo(() => {
    const list: { u: string; v: string; cost: number }[] = []
    const n = cities.length
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; n > j; j++) {
        const u = cities[i]
        const v = cities[j]
        const c = costs[u]?.[v] ?? costs[v]?.[u] ?? 0
        list.push({ u, v, cost: c })
      }
    }
    return list
  }, [cities, costs])

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
                background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(236, 72, 153, 0.35)',
              }}
            >
              <Compass size={16} color="#ffffff" />
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
              <span style={{ color: 'var(--accent-pink, #ec4899)', fontWeight: 600, fontSize: 12 }}>
                Week 3: TSP Heuristics
              </span>
            </div>
          </div>
        </div>

        {/* Center: Algorithm Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.45)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            gap: 2,
          }}
        >
          {TSP_ALGORITHMS.map((algo) => {
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
                  background: isActive ? 'var(--accent-pink, #ec4899)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 0 10px rgba(236, 72, 153, 0.4)' : 'none',
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

        {/* Right: Algorithm-specific inputs & Matrix editor button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {algorithm === 'Nearest-Neighbour-Heuristic' && (
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
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f472b6' }}>Start City:</span>
              <select
                value={startCity}
                onChange={(e) => {
                  setStartCity(e.target.value)
                  runTSP(cities, costs, algorithm, e.target.value, baseCity)
                }}
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(236, 72, 153, 0.4)',
                  borderRadius: 4,
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '2px 4px',
                }}
              >
                {cities.map((c) => (
                  <option key={c} value={c} style={{ background: '#0d131f' }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {algorithm === 'Savings-Heuristic' && (
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
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f472b6' }}>Base City (n):</span>
              <select
                value={baseCity}
                onChange={(e) => {
                  setBaseCity(e.target.value)
                  runTSP(cities, costs, algorithm, startCity, e.target.value)
                }}
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(236, 72, 153, 0.4)',
                  borderRadius: 4,
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '2px 4px',
                }}
              >
                {cities.map((c) => (
                  <option key={c} value={c} style={{ background: '#0d131f' }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Benchmark Presets & Comparison Modal Button */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(236, 72, 153, 0.2)',
              border: '1px solid rgba(236, 72, 153, 0.45)',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 0 10px rgba(236, 72, 153, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(236, 72, 153, 0.32)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)'
            }}
            title="Select Benchmark Presets or Contrast All 3 Heuristics"
          >
            <Sparkles size={13} style={{ color: '#f472b6' }} />
            <span>Benchmarks &amp; Presets</span>
            <span
              style={{
                fontSize: 10,
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '1px 5px',
                borderRadius: 4,
                color: '#fbcfe8',
                maxWidth: 130,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentPresetName}
            </span>
          </button>

          {/* Edit Cost Matrix button */}
          <button
            onClick={() => {
              setTempCosts(JSON.parse(JSON.stringify(costs)))
              setIsMatrixModalOpen(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(236, 72, 153, 0.12)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              color: '#f472b6',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(236, 72, 153, 0.22)'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(236, 72, 153, 0.12)'
              e.currentTarget.style.color = '#f472b6'
            }}
            title="Edit Distance / Cost Matrix"
          >
            <Table size={13} />
            <span>Cost Matrix</span>
          </button>

          {/* Re-run button */}
          <button
            onClick={() => runTSP()}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #db2777, #be185d)',
              border: 'none',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 10px rgba(219, 39, 119, 0.3)',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Running...' : 'Re-Run'}</span>
          </button>
        </div>
      </header>

      {/* Main TSP Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left / Center View: SVG Weighted City Graph & Control Bar */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {/* Static Non-Overlapping TSP Control & Tour Summary Sub-Bar (Standard Flex Flow) */}
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
            {/* Left: Benchmark info & actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Compass size={14} style={{ color: '#f472b6' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>
                  {currentPresetName}
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Cities: <strong style={{ color: '#f472b6' }}>{cities.join(', ')}</strong> ({cities.length} vertices)
              </span>
              <button
                onClick={() => setIsConfigModalOpen(true)}
                style={{
                  background: 'rgba(236, 72, 153, 0.25)',
                  border: '1px solid rgba(236, 72, 153, 0.45)',
                  color: '#fbcfe8',
                  borderRadius: 5,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Benchmark Details / Compare
              </button>
            </div>

            {/* Right: Accumulated Tour Cost & Current Tour (Static, Prominent, 0% Overlap) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {currentEvent?.current_tour && currentEvent.current_tour.length > 0 && (
                <div style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600 }}>
                  Tour: <span style={{ color: '#f472b6', fontFamily: 'var(--font-mono)' }}>{currentEvent.current_tour.join(' → ')}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(236, 72, 153, 0.15)',
                  border: '1px solid rgba(236, 72, 153, 0.35)',
                  padding: '3px 10px',
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>Accumulated Tour Cost:</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#ec4899', fontFamily: 'var(--font-mono)' }}>
                  {currentEvent?.total_cost !== undefined ? currentEvent.total_cost : runResult?.total_cost || 0}
                </span>
              </div>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              minHeight: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, #0f172a 0%, #080c14 100%)',
            }}
          >
            <svg
              viewBox="0 0 520 480"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: 520,
                maxWidth: 560,
                userSelect: 'none',
              }}
            >
              {/* Background complete graph edges */}
              {allEdges.map(({ u, v, cost }) => {
                const posU = cityPositions[u]
                const posV = cityPositions[v]
                if (!posU || !posV) return null

                const isAccepted = acceptedEdgesSet.has(`${u}-${v}`)
                const isCandidate =
                  candidateEdge &&
                  ((candidateEdge[0] === u && candidateEdge[1] === v) ||
                    (candidateEdge[0] === v && candidateEdge[1] === u))

                const midX = (posU.x + posV.x) / 2
                const midY = (posU.y + posV.y) / 2

                let strokeColor = 'rgba(255, 255, 255, 0.08)'
                let strokeWidth = 1.5
                let strokeDash = '4 4'

                if (isAccepted) {
                  strokeColor = '#ec4899'
                  strokeWidth = 3.5
                  strokeDash = 'none'
                } else if (isCandidate) {
                  strokeColor = '#f59e0b'
                  strokeWidth = 3
                  strokeDash = '6 3'
                }

                return (
                  <g key={`${u}-${v}`}>
                    <line
                      x1={posU.x}
                      y1={posU.y}
                      x2={posV.x}
                      y2={posV.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDash}
                      style={{
                        transition: 'all 0.25s ease',
                      }}
                    />
                    {/* Cost label on edge */}
                    <rect
                      x={midX - 12}
                      y={midY - 9}
                      width={24}
                      height={18}
                      rx={4}
                      fill="rgba(10, 15, 26, 0.85)"
                      stroke={isAccepted ? 'rgba(236, 72, 153, 0.6)' : 'rgba(255, 255, 255, 0.15)'}
                      strokeWidth={1}
                    />
                    <text
                      x={midX}
                      y={midY + 4}
                      textAnchor="middle"
                      fill={isAccepted ? '#f472b6' : '#94a3b8'}
                      fontSize={10}
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {cost}
                    </text>
                  </g>
                )
              })}

              {/* City Nodes */}
              {cities.map((city) => {
                const pos = cityPositions[city]
                if (!pos) return null

                const isActive = activeCity === city
                const isBase = (algorithm === 'Savings-Heuristic' && baseCity === city) ||
                               (algorithm === 'Nearest-Neighbour-Heuristic' && startCity === city)

                return (
                  <g key={city} transform={`translate(${pos.x}, ${pos.y})`}>
                    {/* Outer Glow for active or base */}
                    {isActive && (
                      <circle
                        r={28}
                        fill="none"
                        stroke="rgba(245, 158, 11, 0.4)"
                        strokeWidth={4}
                        className="animate-pulse"
                      />
                    )}
                    {isBase && (
                      <circle
                        r={25}
                        fill="none"
                        stroke="rgba(236, 72, 153, 0.5)"
                        strokeWidth={2.5}
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      r={18}
                      fill={isActive ? '#f59e0b' : isBase ? '#be185d' : '#1e293b'}
                      stroke={isActive ? '#ffffff' : isBase ? '#f472b6' : '#475569'}
                      strokeWidth={2.5}
                    />

                    {/* Node label */}
                    <text
                      textAnchor="middle"
                      dy={5}
                      fill="#ffffff"
                      fontSize={14}
                      fontWeight="800"
                      fontFamily="Inter, sans-serif"
                    >
                      {city}
                    </text>

                    {/* Base city tag */}
                    {isBase && (
                      <text
                        textAnchor="middle"
                        dy={-24}
                        fill="#f472b6"
                        fontSize={9}
                        fontWeight="700"
                        fontFamily="Inter, sans-serif"
                      >
                        BASE
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
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
            <PseudocodePanel algorithm={algorithm} currentEvent={currentEvent as any} />
          </div>

          {/* Bottom Half: TSP Inspection Data Structure Panel */}
          <div
            className="glass-panel"
            style={{
              flex: 1,
              minHeight: 0,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#ec4899' }}>
                <GitMerge size={16} />
                <span>HEURISTIC DATA STRUCTURES</span>
              </div>
              <span
                className="pill-tag"
                style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.3)' }}
              >
                Page 4 Spec
              </span>
            </div>

            {/* Savings List Inspection for Savings Heuristic */}
            {algorithm === 'Savings-Heuristic' && (
              <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Savings List (Descending order):
                </div>
                <div style={{ maxHeight: 110, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {currentEvent?.savings_list && currentEvent.savings_list.length > 0 ? (
                    currentEvent.savings_list.map(([a, b, s]: [string, string, number], idx: number) => {
                      const isCurrentCandidate =
                        currentEvent?.selected_edge &&
                        ((currentEvent.selected_edge[0] === a && currentEvent.selected_edge[1] === b) ||
                          (currentEvent.selected_edge[0] === b && currentEvent.selected_edge[1] === a))
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: isCurrentCandidate ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                            border: isCurrentCandidate ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid transparent',
                            fontSize: 11,
                            fontWeight: 700,
                            color: isCurrentCandidate ? '#ffffff' : '#cbd5e1',
                          }}
                        >
                          <span>
                            ({a}, {b})
                          </span>
                          <span style={{ color: '#ec4899', fontFamily: 'JetBrains Mono, monospace' }}>
                            s = {s}
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Generating savings...</span>
                  )}
                </div>
              </div>
            )}

            {/* Sub-Tours List for Savings Heuristic */}
            {algorithm === 'Savings-Heuristic' && currentEvent?.sub_tours && (
              <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Current Active Sub-Tours:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {currentEvent.sub_tours.map((st: string[], idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.04)',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#f472b6',
                      }}
                    >
                      [{st.join(' - ')}]
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Candidate Edges list for Greedy Heuristic */}
            {algorithm === 'Greedy-Heuristic' && (
              <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Candidate Edge Evaluation:
                </div>
                <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.5 }}>
                  {currentEvent?.description || 'Evaluating next shortest edge'}
                </div>
              </div>
            )}

            {/* Step Explanation Card */}
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                Operation Explanation:
              </div>
              <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.5 }}>
                {currentEvent?.description || 'Awaiting TSP heuristic run'}
              </div>
            </div>

            {/* Final Tour completion pill */}
            {currentEvent?.is_terminal && (
              <div
                style={{
                  padding: 10,
                  borderRadius: 6,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#ffffff' }}>
                    TOUR COMPLETE
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
                  Final Hamiltonian Tour: {currentEvent.current_tour?.join(' → ')} (Total Cost: {currentEvent.total_cost})
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cost Matrix Modal */}
      {isMatrixModalOpen && (
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
              width: 'min(500px, 92vw)',
              background: '#0d131f',
              border: '1px solid rgba(236, 72, 153, 0.4)',
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
                <Table size={18} style={{ color: '#ec4899' }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Edit Symmetric Cost / Distance Matrix
                </h3>
              </div>
              <button
                onClick={() => setIsMatrixModalOpen(false)}
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
              Set pairwise costs between cities. Changing cost (u, v) automatically updates (v, u).
            </p>

            {/* Matrix Table */}
            <div style={{ overflowX: 'auto', marginBottom: 18 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th style={{ padding: 6, color: 'var(--text-dim)', fontSize: 11 }}></th>
                    {cities.map((c) => (
                      <th key={c} style={{ padding: 6, color: '#f472b6', fontSize: 12, fontWeight: 800 }}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cities.map((u) => (
                    <tr key={u}>
                      <td style={{ padding: 6, color: '#f472b6', fontSize: 12, fontWeight: 800 }}>
                        {u}
                      </td>
                      {cities.map((v) => {
                        const isDiag = u === v
                        const val = tempCosts[u]?.[v] ?? tempCosts[v]?.[u] ?? 0
                        return (
                          <td key={v} style={{ padding: 4 }}>
                            {isDiag ? (
                              <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>0</span>
                            ) : (
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={val}
                                onChange={(e) => {
                                  const c = Math.max(1, parseFloat(e.target.value) || 1)
                                  setTempCosts((prev) => ({
                                    ...prev,
                                    [u]: { ...(prev[u] || {}), [v]: c },
                                    [v]: { ...(prev[v] || {}), [u]: c },
                                  }))
                                }}
                                style={{
                                  width: 44,
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 4,
                                  color: '#ffffff',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  textAlign: 'center',
                                  padding: '3px 2px',
                                }}
                              />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setIsMatrixModalOpen(false)}
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
                  setCosts(tempCosts)
                  setIsMatrixModalOpen(false)
                  runTSP(cities, tempCosts, algorithm, startCity, baseCity)
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, #db2777, #be185d)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(219, 39, 119, 0.4)',
                }}
              >
                Apply & Re-Run
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TSP Benchmark Presets, Matrix Editor & Comparison Modal */}
      <TSPConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentCities={cities}
        currentCosts={costs}
        currentStartCity={startCity}
        currentBaseCity={baseCity}
        onApplyPreset={handleApplyPreset}
        onApplyCosts={handleApplyCosts}
        onSelectAlgorithmToTrace={handleSelectAlgorithmToTrace}
      />
    </div>
  )
}

export default TSPVisualizer
