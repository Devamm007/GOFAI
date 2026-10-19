import React, { useState } from 'react'
import {
  X,
  Compass,
  CheckCircle2,
  Table,
  Sparkles,
  GitCompare,
  Award,
} from 'lucide-react'
import { TSP_PRESETS, type TSPPreset } from '../data/tspPresets'
import type { TSPResult } from '../types'
import { apiUrl } from '../utils/api'

export interface TSPConfigModalProps {
  isOpen: boolean
  onClose: () => void
  currentCities: string[]
  currentCosts: Record<string, Record<string, number>>
  currentStartCity: string
  currentBaseCity: string
  onApplyPreset: (preset: TSPPreset) => void
  onApplyCosts: (cities: string[], costs: Record<string, Record<string, number>>) => void
  onSelectAlgorithmToTrace?: (algo: string) => void
}

export const TSPConfigModal: React.FC<TSPConfigModalProps> = ({
  isOpen,
  onClose,
  currentCities,
  currentCosts,
  currentStartCity,
  currentBaseCity,
  onApplyPreset,
  onApplyCosts,
  onSelectAlgorithmToTrace,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'matrix' | 'compare'>('presets')
  const [selectedPresetId, setSelectedPresetId] = useState<string>(TSP_PRESETS[0].id)

  // Matrix state
  const [tempCosts, setTempCosts] = useState<Record<string, Record<string, number>>>(() =>
    JSON.parse(JSON.stringify(currentCosts))
  )

  // Comparison state
  const [comparisonResults, setComparisonResults] = useState<{
    nn?: TSPResult
    greedy?: TSPResult
    savings?: TSPResult
  } | null>(null)
  const [isComparing, setIsComparing] = useState<boolean>(false)

  if (!isOpen) return null

  const activePreset = TSP_PRESETS.find((p) => p.id === selectedPresetId) || TSP_PRESETS[0]

  const handleRunComparison = async () => {
    try {
      setIsComparing(true)
      // Run NN, Greedy, and Savings in parallel on current costs
      const [nnRes, greedyRes, savingsRes] = await Promise.all([
        fetch(apiUrl('/api/search/tsp/run'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cities: currentCities,
            costs: currentCosts,
            algorithm: 'Nearest-Neighbour-Heuristic',
            start_city: currentStartCity,
          }),
        }).then((r) => r.json()),

        fetch(apiUrl('/api/search/tsp/run'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cities: currentCities,
            costs: currentCosts,
            algorithm: 'Greedy-Heuristic',
          }),
        }).then((r) => r.json()),

        fetch(apiUrl('/api/search/tsp/run'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cities: currentCities,
            costs: currentCosts,
            algorithm: 'Savings-Heuristic',
            base_city: currentBaseCity,
          }),
        }).then((r) => r.json()),
      ])

      setComparisonResults({
        nn: nnRes,
        greedy: greedyRes,
        savings: savingsRes,
      })
    } catch (err: any) {
      console.error('Failed to run comparison:', err)
      alert(`Comparison failed: ${err.message}`)
    } finally {
      setIsComparing(false)
    }
  }

  // Find min cost among comparison results
  const minCost = comparisonResults
    ? Math.min(
        comparisonResults.nn?.total_cost ?? Infinity,
        comparisonResults.greedy?.total_cost ?? Infinity,
        comparisonResults.savings?.total_cost ?? Infinity
      )
    : null

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
          maxWidth: 840,
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(236, 72, 153, 0.35)',
          borderRadius: 16,
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(236, 72, 153, 0.15)',
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
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                TSP Heuristic Benchmarks &amp; Algorithm Contrast
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
                Analyze pros, cons, and trade-offs of Nearest-Neighbour, Greedy, and Savings
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
              borderBottom: activeTab === 'presets' ? '2px solid #ec4899' : '2px solid transparent',
              color: activeTab === 'presets' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Sparkles size={15} style={{ color: activeTab === 'presets' ? '#ec4899' : 'inherit' }} />
            <span>Educational Benchmark Presets</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('compare')
              if (!comparisonResults && !isComparing) {
                handleRunComparison()
              }
            }}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'compare' ? '2px solid #ec4899' : '2px solid transparent',
              color: activeTab === 'compare' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <GitCompare size={15} style={{ color: activeTab === 'compare' ? '#ec4899' : 'inherit' }} />
            <span>Side-by-Side Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'matrix' ? '2px solid #ec4899' : '2px solid transparent',
              color: activeTab === 'matrix' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Table size={15} style={{ color: activeTab === 'matrix' ? '#ec4899' : 'inherit' }} />
            <span>Cost Matrix Editor</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: 22, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div style={{ display: 'flex', gap: 18, height: '100%', minHeight: 420 }}>
              {/* Presets List */}
              <div
                style={{
                  width: '38%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  overflowY: 'auto',
                  paddingRight: 6,
                }}
              >
                {TSP_PRESETS.map((p) => {
                  const isSelected = p.id === selectedPresetId
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPresetId(p.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: isSelected
                          ? 'rgba(236, 72, 153, 0.16)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected
                          ? '1px solid rgba(236, 72, 153, 0.5)'
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
                          {p.cities.length} cities
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
                        {p.description}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
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
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Cities: <strong style={{ color: '#ffffff' }}>{activePreset.cities.join(', ')}</strong>
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
                  {activePreset.name}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-light, #e2e8f0)', marginBottom: 14, lineHeight: 1.5 }}>
                  {activePreset.description}
                </p>

                {/* Algorithmic Contrast Summary Alert */}
                <div
                  style={{
                    background: 'rgba(236, 72, 153, 0.1)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <GitCompare size={15} color="#ec4899" />
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#f472b6', textTransform: 'uppercase' }}>
                      Heuristic Contrast Summary
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#fbcfe8', margin: 0, lineHeight: 1.5 }}>
                    {activePreset.contrastSummary}
                  </p>
                </div>

                {/* 3-Column Detailed Algorithm Analysis */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {/* Nearest Neighbour */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: 8,
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <h5 style={{ fontSize: 12, fontWeight: 700, color: '#f472b6', margin: '0 0 6px 0' }}>
                      Nearest Neighbour
                    </h5>
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                        Advantage
                      </span>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 0', lineHeight: 1.35 }}>
                        {activePreset.nnAnalysis.pros}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#f87171', textTransform: 'uppercase' }}>
                        Disadvantage
                      </span>
                      <p style={{ fontSize: 11, color: '#fca5a5', margin: '2px 0 0 0', lineHeight: 1.35 }}>
                        {activePreset.nnAnalysis.cons}
                      </p>
                    </div>
                  </div>

                  {/* Greedy */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: 8,
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <h5 style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', margin: '0 0 6px 0' }}>
                      Greedy Heuristic
                    </h5>
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                        Advantage
                      </span>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 0', lineHeight: 1.35 }}>
                        {activePreset.greedyAnalysis.pros}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#f87171', textTransform: 'uppercase' }}>
                        Disadvantage
                      </span>
                      <p style={{ fontSize: 11, color: '#fca5a5', margin: '2px 0 0 0', lineHeight: 1.35 }}>
                        {activePreset.greedyAnalysis.cons}
                      </p>
                    </div>
                  </div>

                  {/* Savings */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: 8,
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <h5 style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', margin: '0 0 6px 0' }}>
                      Savings (Clarke-Wright)
                    </h5>
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
                        Advantage
                      </span>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 0', lineHeight: 1.35 }}>
                        {activePreset.savingsAnalysis.pros}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#f87171', textTransform: 'uppercase' }}>
                        Disadvantage
                      </span>
                      <p style={{ fontSize: 11, color: '#fca5a5', margin: '2px 0 0 0', lineHeight: 1.35 }}>
                        {activePreset.savingsAnalysis.cons}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                  <button
                    onClick={() => {
                      onApplyPreset(activePreset)
                      onClose()
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 18px',
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #ec4899, #db2777)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Load Benchmark Preset &amp; Re-Run Visualizer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIDE-BY-SIDE COMPARISON */}
          {activeTab === 'compare' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Side-by-Side Tour Evaluation on Current Matrix
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    Running Nearest-Neighbour (start: {currentStartCity}), Greedy, and Savings (base: {currentBaseCity})
                  </p>
                </div>
                <button
                  onClick={handleRunComparison}
                  disabled={isComparing}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    background: 'rgba(236, 72, 153, 0.2)',
                    border: '1px solid rgba(236, 72, 153, 0.45)',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: isComparing ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isComparing ? 'Evaluating...' : 'Refresh Evaluation'}
                </button>
              </div>

              {isComparing && (
                <div style={{ padding: 40, textAlign: 'center', color: '#f472b6' }}>
                  Evaluating all three algorithms against the current cost matrix...
                </div>
              )}

              {!isComparing && comparisonResults && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  {/* Nearest Neighbour Card */}
                  {comparisonResults.nn && (
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border:
                          comparisonResults.nn.total_cost === minCost
                            ? '2px solid #10b981'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        boxShadow:
                          comparisonResults.nn.total_cost === minCost
                            ? '0 0 20px rgba(16, 185, 129, 0.25)'
                            : 'none',
                      }}
                    >
                      {comparisonResults.nn.total_cost === minCost && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -10,
                            right: 12,
                            background: '#10b981',
                            color: '#042f2e',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Award size={12} />
                          BEST RESULT
                        </div>
                      )}
                      <h4 style={{ fontSize: 13, fontWeight: 800, color: '#f472b6', margin: '0 0 4px 0' }}>
                        Nearest Neighbour
                      </h4>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12 }}>
                        Greedy hop from {currentStartCity}
                      </span>

                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Tour Cost:</span>
                        <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff' }}>
                          {comparisonResults.nn.total_cost}
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                          Constructed Tour:
                        </span>
                        <div
                          style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            padding: '6px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontFamily: 'var(--font-mono)',
                            color: '#38bdf8',
                            lineHeight: 1.4,
                          }}
                        >
                          {comparisonResults.nn.tour.join(' → ')}
                        </div>
                      </div>

                      {onSelectAlgorithmToTrace && (
                        <button
                          onClick={() => {
                            onSelectAlgorithmToTrace('Nearest-Neighbour-Heuristic')
                            onClose()
                          }}
                          style={{
                            marginTop: 'auto',
                            padding: '7px 12px',
                            borderRadius: 6,
                            background: 'rgba(236, 72, 153, 0.15)',
                            border: '1px solid rgba(236, 72, 153, 0.35)',
                            color: '#f472b6',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Trace in Visualizer
                        </button>
                      )}
                    </div>
                  )}

                  {/* Greedy Card */}
                  {comparisonResults.greedy && (
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border:
                          comparisonResults.greedy.total_cost === minCost
                            ? '2px solid #10b981'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        boxShadow:
                          comparisonResults.greedy.total_cost === minCost
                            ? '0 0 20px rgba(16, 185, 129, 0.25)'
                            : 'none',
                      }}
                    >
                      {comparisonResults.greedy.total_cost === minCost && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -10,
                            right: 12,
                            background: '#10b981',
                            color: '#042f2e',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Award size={12} />
                          BEST RESULT
                        </div>
                      )}
                      <h4 style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24', margin: '0 0 4px 0' }}>
                        Greedy Heuristic
                      </h4>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12 }}>
                        Global edge cost sorting
                      </span>

                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Tour Cost:</span>
                        <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff' }}>
                          {comparisonResults.greedy.total_cost}
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                          Constructed Tour:
                        </span>
                        <div
                          style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            padding: '6px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontFamily: 'var(--font-mono)',
                            color: '#fbbf24',
                            lineHeight: 1.4,
                          }}
                        >
                          {comparisonResults.greedy.tour.join(' → ')}
                        </div>
                      </div>

                      {onSelectAlgorithmToTrace && (
                        <button
                          onClick={() => {
                            onSelectAlgorithmToTrace('Greedy-Heuristic')
                            onClose()
                          }}
                          style={{
                            marginTop: 'auto',
                            padding: '7px 12px',
                            borderRadius: 6,
                            background: 'rgba(251, 191, 36, 0.15)',
                            border: '1px solid rgba(251, 191, 36, 0.35)',
                            color: '#fbbf24',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Trace in Visualizer
                        </button>
                      )}
                    </div>
                  )}

                  {/* Savings Card */}
                  {comparisonResults.savings && (
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border:
                          comparisonResults.savings.total_cost === minCost
                            ? '2px solid #10b981'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        boxShadow:
                          comparisonResults.savings.total_cost === minCost
                            ? '0 0 20px rgba(16, 185, 129, 0.25)'
                            : 'none',
                      }}
                    >
                      {comparisonResults.savings.total_cost === minCost && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -10,
                            right: 12,
                            background: '#10b981',
                            color: '#042f2e',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Award size={12} />
                          BEST RESULT
                        </div>
                      )}
                      <h4 style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8', margin: '0 0 4px 0' }}>
                        Savings (Clarke-Wright)
                      </h4>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12 }}>
                        Base city {currentBaseCity} subtour merges
                      </span>

                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Tour Cost:</span>
                        <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff' }}>
                          {comparisonResults.savings.total_cost}
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                          Constructed Tour:
                        </span>
                        <div
                          style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            padding: '6px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontFamily: 'var(--font-mono)',
                            color: '#34d399',
                            lineHeight: 1.4,
                          }}
                        >
                          {comparisonResults.savings.tour.join(' → ')}
                        </div>
                      </div>

                      {onSelectAlgorithmToTrace && (
                        <button
                          onClick={() => {
                            onSelectAlgorithmToTrace('Savings-Heuristic')
                            onClose()
                          }}
                          style={{
                            marginTop: 'auto',
                            padding: '7px 12px',
                            borderRadius: 6,
                            background: 'rgba(56, 189, 248, 0.15)',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            color: '#38bdf8',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Trace in Visualizer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MATRIX EDITOR */}
          {activeTab === 'matrix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Set pairwise costs between cities. Changing cost (u, v) automatically updates reciprocal edge (v, u).
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: 6, color: 'var(--text-dim)', fontSize: 11 }}></th>
                      {currentCities.map((c) => (
                        <th key={c} style={{ padding: 6, color: '#f472b6', fontSize: 12, fontWeight: 800 }}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentCities.map((u) => (
                      <tr key={u}>
                        <td style={{ padding: 6, color: '#f472b6', fontSize: 12, fontWeight: 800 }}>{u}</td>
                        {currentCities.map((v) => {
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
                                  max={200}
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
                                    width: 48,
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  onClick={() => {
                    onApplyCosts(currentCities, tempCosts)
                    onClose()
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #ec4899, #db2777)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Apply Matrix &amp; Re-Run</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TSPConfigModal
