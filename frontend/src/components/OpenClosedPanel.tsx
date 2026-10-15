import React from 'react'
import type { TraceEvent } from '../types'
import { Layers, CheckCircle2, Info } from 'lucide-react'

interface OpenClosedPanelProps {
  currentEvent?: TraceEvent | null
  onSelectNode?: (nodeId: string) => void
  selectedNodeId?: string | null
}

function formatTuple(item: any): { node: string; parent: string; depth: number | null; text: string } {
  if (!Array.isArray(item)) return { node: String(item), parent: 'null', depth: null, text: String(item) }
  const node = String(item[0])
  const parent = item[1] === null || item[1] === undefined ? 'null' : String(item[1])
  if (item.length >= 3) {
    const depth = Number(item[2])
    return { node, parent, depth, text: `(${node}, ${parent}, ${depth})` }
  }
  return { node, parent, depth: null, text: `(${node}, ${parent})` }
}

export const OpenClosedPanel: React.FC<OpenClosedPanelProps> = ({
  currentEvent,
  onSelectNode,
  selectedNodeId,
}) => {
  const openList = currentEvent?.open_after || []
  const closedList = currentEvent?.closed_after || []
  const openSize = currentEvent?.open_size_after ?? openList.length
  const closedSize = currentEvent?.closed_size_after ?? closedList.length
  const isDfid = Boolean(currentEvent?.algorithm?.startsWith('DFID'))

  // Set of recently added pairs in this step
  const newPairsSet = new Set<string>()
  if (currentEvent?.new_pairs) {
    for (const pair of currentEvent.new_pairs) {
      if (Array.isArray(pair) && pair.length > 0) {
        newPairsSet.add(pair[0])
      }
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* DFID LIST PERSISTENCE NOTE */}
      {isDfid && (
        <div
          style={{
            padding: '7px 10px',
            borderRadius: 8,
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            fontSize: 11,
            lineHeight: 1.45,
            color: '#93c5fd',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 7,
            flexShrink: 0,
          }}
        >
          <Info size={15} style={{ flexShrink: 0, marginTop: 1, color: '#60a5fa' }} />
          <div>
            <span style={{ fontWeight: 600, color: '#bfdbfe' }}>
              {currentEvent?.algorithm} Execution:
            </span>{' '}
            OPEN &amp; CLOSED from completed DB-DFS passes are preserved across outer{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '1px 4px', borderRadius: 3 }}>
              depthBound
            </code>{' '}
            increments until reset at Lines 11–12 of the next iteration.
          </div>
        </div>
      )}

      {/* OPEN LIST PANEL */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 12,
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: 'var(--accent-cyan)' }}>
            <Layers size={16} />
            <span>OPEN (Frontier)</span>
          </div>
          <span
            className="pill-tag"
            style={{
              color: '#ffffff',
              background: 'rgba(6, 182, 212, 0.25)',
              borderColor: 'rgba(6, 182, 212, 0.5)',
              fontWeight: 800,
            }}
          >
            Size: {openSize}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, paddingRight: 2 }}>
          {openList.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: 12, padding: '16px 6px', textAlign: 'center' }}>
              [] (empty queue/stack)
            </div>
          ) : (
            openList.map((item, idx) => {
              const parsed = formatTuple(item)
              const isHead = idx === 0
              const isNewlyAdded = newPairsSet.has(parsed.node)
              const isSelected = selectedNodeId === parsed.node

              return (
                <div
                  key={`open-${idx}-${parsed.text}`}
                  onClick={() => onSelectNode && onSelectNode(parsed.node)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: isSelected
                      ? 'rgba(99, 102, 241, 0.3)'
                      : isHead
                      ? 'rgba(6, 182, 212, 0.16)'
                      : isNewlyAdded
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected
                      ? '1px solid #ffffff'
                      : isHead
                      ? '1px solid rgba(6, 182, 212, 0.5)'
                      : isNewlyAdded
                      ? '1px solid rgba(16, 185, 129, 0.35)'
                      : '1px solid transparent',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    transition: 'all 0.15s ease',
                  }}
                  title="Click to focus node in graph"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#64748b', fontSize: 10, width: 18 }}>[{idx}]</span>
                    <span style={{ fontWeight: isHead ? 700 : 500, color: isHead ? '#ffffff' : '#e2e8f0' }}>
                      {parsed.text}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isNewlyAdded && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(16, 185, 129, 0.25)',
                          color: '#6ee7b7',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                        }}
                      >
                        NEW +
                      </span>
                    )}
                    {isHead && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'var(--accent-cyan)',
                          color: '#083344',
                        }}
                      >
                        HEAD
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* CLOSED LIST PANEL */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 12,
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#f87171' }}>
            <CheckCircle2 size={16} />
            <span>CLOSED (Explored)</span>
          </div>
          <span
            className="pill-tag"
            style={{
              color: '#fca5a5',
              background: 'rgba(239, 68, 68, 0.16)',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              fontWeight: 800,
            }}
          >
            Size: {closedSize}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, paddingRight: 2 }}>
          {closedList.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: 12, padding: '16px 6px', textAlign: 'center' }}>
              [] (empty list)
            </div>
          ) : (
            closedList.map((item, idx) => {
              const parsed = formatTuple(item)
              const isRecent = idx === 0
              const isSelected = selectedNodeId === parsed.node

              return (
                <div
                  key={`closed-${idx}-${parsed.text}`}
                  onClick={() => onSelectNode && onSelectNode(parsed.node)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: isSelected
                      ? 'rgba(99, 102, 241, 0.3)'
                      : isRecent
                      ? 'rgba(239, 68, 68, 0.16)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected
                      ? '1px solid #ffffff'
                      : isRecent
                      ? '1px solid rgba(239, 68, 68, 0.45)'
                      : '1px solid transparent',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    transition: 'all 0.15s ease',
                  }}
                  title="Click to focus node in graph"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#64748b', fontSize: 10, width: 18 }}>[{idx}]</span>
                    <span style={{ fontWeight: isRecent ? 600 : 400, color: isRecent ? '#fee2e2' : '#cbd5e1' }}>
                      {parsed.text}
                    </span>
                  </div>

                  {isRecent && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: 'rgba(239, 68, 68, 0.25)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                      }}
                    >
                      RECENT
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
