import React, { useEffect, useState } from 'react'
import type { RunSummary } from '../types'
import { X, History, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react'
import { apiUrl } from '../utils/api'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  onLoadRun: (runId: string) => Promise<void>
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadRun,
}) => {
  const [runs, setRuns] = useState<RunSummary[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRuns = async () => {
    try {
      setLoading(true)
      const res = await fetch(apiUrl('/api/runs'))
      if (res.ok) {
        const data = await res.json()
        setRuns(data)
      }
    } catch (err) {
      console.error('Failed to fetch runs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchRuns()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSelect = async (id: string) => {
    await onLoadRun(id)
    onClose()
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
          maxWidth: 640,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
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
            <History size={18} style={{ color: 'var(--accent-amber)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>Persisted Execution Runs</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={fetchRuns}
              className="btn btn-secondary btn-icon"
              style={{ width: 32, height: 32 }}
              title="Refresh runs"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* List of Runs */}
        <div style={{ padding: 16, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
              Loading persisted runs...
            </div>
          ) : runs.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
              No persisted runs found in database. Run an algorithm to create a persistent trace.
            </div>
          ) : (
            runs.map((r) => (
              <div
                key={r.id}
                onClick={() => handleSelect(r.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s',
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
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {r.algorithm}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
                      {r.start_node} → {r.goal_node}
                    </span>
                    {r.found_goal ? (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          color: 'var(--accent-emerald)',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle2 size={13} /> Success
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          color: 'var(--accent-rose)',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <AlertTriangle size={13} /> Unreachable
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {r.total_steps} steps • {r.nodes_expanded} expanded • {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-indigo)', fontSize: 12, fontWeight: 600 }}>
                  <span>Replay</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
