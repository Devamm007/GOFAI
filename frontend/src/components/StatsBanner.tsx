import React from 'react'
import type { TraceEvent, SearchRunResponse } from '../types'
import { CheckCircle2, AlertTriangle, ArrowRight, Footprints } from 'lucide-react'

interface StatsBannerProps {
  runResult?: SearchRunResponse | null
  currentEvent?: TraceEvent | null
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ runResult, currentEvent }) => {
  if (!runResult && !currentEvent) return null

  const isTerminal = currentEvent?.is_terminal || false
  const foundGoal = runResult?.found_goal || (isTerminal && currentEvent?.terminal_status === 'SUCCESS')
  const finalPath = currentEvent?.path || runResult?.path || []

  return (
    <div
      className="glass-panel"
      style={{
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        background: foundGoal
          ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.85))'
          : isTerminal
          ? 'linear-gradient(90deg, rgba(244, 63, 94, 0.15), rgba(15, 23, 42, 0.85))'
          : 'rgba(15, 23, 42, 0.75)',
        borderLeft: foundGoal
          ? '4px solid var(--accent-emerald)'
          : isTerminal
          ? '4px solid var(--accent-rose)'
          : '4px solid var(--accent-indigo)',
      }}
    >
      {/* Status Title and Path */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {foundGoal ? (
            <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
          ) : isTerminal ? (
            <AlertTriangle size={18} style={{ color: 'var(--accent-rose)' }} />
          ) : (
            <Footprints size={18} style={{ color: 'var(--accent-indigo)' }} />
          )}

          <span style={{ fontWeight: 700, fontSize: 13, color: '#f8fafc' }}>
            {foundGoal
              ? 'GOAL REACHED'
              : isTerminal
              ? currentEvent?.terminal_status || 'TERMINATED'
              : `SEARCHING (${currentEvent?.algorithm || runResult?.algorithm})`}
          </span>
        </div>

        {/* Path Display */}
        {finalPath && finalPath.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Path:</span>
            {finalPath.map((node, i) => (
              <React.Fragment key={`path-${node}-${i}`}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: i === 0 ? 'rgba(16, 185, 129, 0.3)' : i === finalPath.length - 1 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.25)',
                    border: '1px solid rgba(74, 222, 128, 0.4)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {node}
                </span>
                {i < finalPath.length - 1 && (
                  <ArrowRight size={12} style={{ color: '#64748b' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {isTerminal && !foundGoal && (
          <span style={{ fontSize: 12, color: '#fda4af' }}>
            {currentEvent?.terminal_reason || runResult?.terminal_reason || 'Goal unreachable'}
          </span>
        )}
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {currentEvent?.depth_bound !== undefined && currentEvent?.depth_bound !== null && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Depth Bound</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: '#c084fc' }}>
              {currentEvent.depth_bound}
            </span>
          </div>
        )}

        {currentEvent?.current_depth !== undefined && currentEvent?.current_depth !== null && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Current Depth</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: 'var(--accent-cyan)' }}>
              {currentEvent.current_depth}
            </span>
          </div>
        )}

        {runResult && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Nodes Expanded</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: '#f1f5f9' }}>
              {runResult.nodes_expanded}
            </span>
          </div>
        )}

        {finalPath && finalPath.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Path Moves</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: 'var(--accent-emerald)' }}>
              {finalPath.length - 1}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
