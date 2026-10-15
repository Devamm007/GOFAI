import React, { useEffect, useRef } from 'react'
import type { TraceEvent } from '../types'
import { Terminal } from 'lucide-react'

interface EventLogPanelProps {
  events: TraceEvent[]
  currentStepIndex: number
  onSelectStep: (index: number) => void
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({
  events,
  currentStepIndex,
  onSelectStep,
}) => {
  const activeItemRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [currentStepIndex])

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 12,
        height: '100%',
        background: 'rgba(15, 23, 42, 0.7)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          paddingBottom: 6,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#f59e0b' }}>
          <Terminal size={16} />
          <span>EXECUTION TRACE LOG</span>
        </div>
        <span
          className="pill-tag"
          style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
        >
          {events.length} Steps
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {events.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: 12, padding: '24px 8px', textAlign: 'center' }}>
            No execution trace loaded. Run search to generate trace events.
          </div>
        ) : (
          events.map((ev, idx) => {
            const isActive = idx === currentStepIndex
            return (
              <div
                key={`event-${ev.step_index}-${ev.event_type}`}
                ref={isActive ? activeItemRef : null}
                onClick={() => onSelectStep(idx)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: isActive ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                  border: isActive ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: isActive ? '#f59e0b' : '#64748b', fontWeight: 600 }}>
                      #{ev.step_index}
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: isActive ? '#ffffff' : '#cbd5e1',
                        fontSize: 11,
                      }}
                    >
                      {ev.event_type}
                    </span>
                  </div>
                  {ev.current_node && (
                    <span
                      style={{
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: 'rgba(139, 92, 246, 0.25)',
                        color: '#c084fc',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: 10,
                      }}
                    >
                      Node: {ev.current_node}
                    </span>
                  )}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ev.description}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
