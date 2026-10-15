import React, { useState } from 'react'
import type { TraceEvent } from '../types'
import { PseudocodePanel } from './PseudocodePanel'
import { EventLogPanel } from './EventLogPanel'
import { Code2, Terminal, ChevronDown, ChevronUp, Columns } from 'lucide-react'

interface AnalysisAreaProps {
  algorithm: string
  currentEvent?: TraceEvent | null
  events: TraceEvent[]
  currentStepIndex: number
  onSelectStep: (index: number) => void
}

export const AnalysisArea: React.FC<AnalysisAreaProps> = ({
  algorithm,
  currentEvent,
  events,
  currentStepIndex,
  onSelectStep,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<'split' | 'pseudocode' | 'log'>('split')

  if (isCollapsed) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.9)',
          cursor: 'pointer',
        }}
        onClick={() => setIsCollapsed(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 600 }}>
          <span style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Code2 size={14} /> Pseudocode ({algorithm})
          </span>
          <span style={{ color: '#64748b' }}>•</span>
          <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Terminal size={14} /> Trace Log ({events.length} steps)
          </span>
          {currentEvent && (
            <span style={{ color: '#94a3b8', fontSize: 11, marginLeft: 12 }}>
              Current: <strong>{currentEvent.event_type}</strong> - {currentEvent.description}
            </span>
          )}
        </div>

        <button
          className="btn btn-secondary"
          style={{ padding: '3px 8px', fontSize: 11 }}
          onClick={(e) => {
            e.stopPropagation()
            setIsCollapsed(false)
          }}
        >
          <ChevronUp size={14} />
          <span>Expand Analysis</span>
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 240,
        minHeight: 180,
        maxHeight: 320,
        gap: 6,
      }}
    >
      {/* Sub-header with Tab & Collapse toggles */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setViewMode('split')}
            style={{
              background: viewMode === 'split' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: viewMode === 'split' ? '#ffffff' : '#94a3b8',
              border: viewMode === 'split' ? '1px solid var(--accent-indigo)' : '1px solid transparent',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Columns size={12} />
            <span>Split View</span>
          </button>

          <button
            onClick={() => setViewMode('pseudocode')}
            style={{
              background: viewMode === 'pseudocode' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: viewMode === 'pseudocode' ? '#ffffff' : '#94a3b8',
              border: viewMode === 'pseudocode' ? '1px solid #a855f7' : '1px solid transparent',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Code2 size={12} />
            <span>Pseudocode Only</span>
          </button>

          <button
            onClick={() => setViewMode('log')}
            style={{
              background: viewMode === 'log' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
              color: viewMode === 'log' ? '#ffffff' : '#94a3b8',
              border: viewMode === 'log' ? '1px solid #f59e0b' : '1px solid transparent',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Terminal size={12} />
            <span>Event Trace Log</span>
          </button>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          title="Collapse lower analysis panel"
        >
          <ChevronDown size={14} />
          <span>Collapse</span>
        </button>
      </div>

      {/* Panels View */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr', gap: 10, minHeight: 0 }}>
        {(viewMode === 'split' || viewMode === 'pseudocode') && (
          <PseudocodePanel algorithm={algorithm} currentEvent={currentEvent} />
        )}

        {(viewMode === 'split' || viewMode === 'log') && (
          <EventLogPanel
            events={events}
            currentStepIndex={currentStepIndex}
            onSelectStep={onSelectStep}
          />
        )}
      </div>
    </div>
  )
}
