import React, { useEffect, useRef } from 'react';
import type { AppRoute } from '../utils/router';
import {
  Compass,
  Network,
  Box,
  BookOpen,
  Sparkles,
  X,
  ExternalLink,
  ChevronRight,
  FileText,
  CheckCircle2,
} from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: AppRoute;
  currentAlgorithm?: string;
  onNavigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentRoute,
  currentAlgorithm = 'BFS',
  onNavigate,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Focus close button for accessibility
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scrolling while open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const uninformedAlgos = [
    { id: 'BFS', label: 'BFS', desc: 'Breadth-First Search (Queue FIFO)' },
    { id: 'DFS', label: 'DFS', desc: 'Depth-First Search (Stack LIFO)' },
    { id: 'DFID-N', label: 'DFID-N', desc: 'Iterative Deepening (New Only)' },
    { id: 'DFID-C', label: 'DFID-C', desc: 'Iterative Deepening (Closed Reopen)' },
  ];

  const pdfDocs = [
    { title: 'symbols.pdf', desc: 'Notation, cons (:), append (++), tuples', path: '/docs/symbols.pdf' },
    { title: 'algorithms_week2.pdf', desc: 'Uninformed Search Specs & Ancillary functions', path: '/docs/algorithms_week2.pdf' },
    { title: 'algorithms_week3.pdf', desc: 'Informed Search, Tie-breaking, & Beam Search', path: '/docs/algorithms_week3.pdf' },
  ];

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Application Navigation"
    >
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          transition: 'opacity 0.2s ease',
        }}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: 'min(360px, 85vw)',
          height: '100%',
          background: '#0d131f',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: '10px 0 35px -5px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 101,
          animation: 'slideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Network size={18} color="#ffffff" />
            </div>
            <div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#ffffff',
                  fontFamily: 'var(--font-display)',
                  display: 'block',
                  lineHeight: 1.2,
                }}
              >
                AI Search Lab
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                IIT Madras • AI SMPS
              </span>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close navigation drawer"
            style={{
              padding: '6px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Item 1: Home / Overview */}
          <div>
            <button
              onClick={() => onNavigate('landing')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: currentRoute === 'landing'
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.15))'
                  : 'transparent',
                border: currentRoute === 'landing'
                  ? '1px solid rgba(99, 102, 241, 0.4)'
                  : '1px solid transparent',
                color: currentRoute === 'landing' ? '#ffffff' : 'var(--text-main)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (currentRoute !== 'landing') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentRoute !== 'landing') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Compass size={17} style={{ color: 'var(--accent-indigo)' }} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Lab Overview</span>
              </div>
              {currentRoute === 'landing' && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent-indigo)',
                    boxShadow: '0 0 8px var(--accent-indigo)',
                  }}
                />
              )}
            </button>
          </div>

          {/* Item 2: Uninformed Search (with algorithms tree) */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: currentRoute === 'visualizer' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: currentRoute === 'visualizer' ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid var(--border-subtle)',
            }}
          >
            <div
              onClick={() => onNavigate('visualizer', { algo: currentAlgorithm })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Network size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                  Uninformed Search
                </span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--accent-emerald)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                Week 2
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 12, borderLeft: '2px solid rgba(99, 102, 241, 0.2)' }}>
              {uninformedAlgos.map((algo) => {
                const isActiveAlgo = currentRoute === 'visualizer' && currentAlgorithm === algo.id;
                return (
                  <button
                    key={algo.id}
                    onClick={() => onNavigate('visualizer', { algo: algo.id })}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isActiveAlgo ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                      border: isActiveAlgo ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                      color: isActiveAlgo ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActiveAlgo) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActiveAlgo) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{algo.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>{algo.desc}</div>
                    </div>
                    {isActiveAlgo ? (
                      <CheckCircle2 size={13} style={{ color: 'var(--accent-emerald)' }} />
                    ) : (
                      <ChevronRight size={12} style={{ opacity: 0.4 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item 3: Heuristic Landscape Visualizer */}
          <div>
            <a
              href="/week3-pa4-gemini.html"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.06)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                color: 'var(--text-main)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.25)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Box size={17} style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                    Heuristic Landscape
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                    Blocks World • 3D Terrain & Hill Climbing
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: 'rgba(6, 182, 212, 0.2)',
                    color: 'var(--accent-cyan)',
                  }}
                >
                  3D
                </span>
                <ExternalLink size={13} style={{ color: 'var(--accent-cyan)', opacity: 0.8 }} />
              </div>
            </a>
          </div>

          {/* Item 4: Official Week-wise Notes */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: currentRoute === 'notes' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              border: currentRoute === 'notes' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
            }}
          >
            <div
              onClick={() => onNavigate('notes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={16} style={{ color: 'var(--accent-amber)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                  Official Course Notes
                </span>
              </div>
              {currentRoute === 'notes' && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent-amber)',
                    boxShadow: '0 0 8px var(--accent-amber)',
                  }}
                />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 12, borderLeft: '2px solid rgba(245, 158, 11, 0.2)' }}>
              {pdfDocs.map((doc) => (
                <a
                  key={doc.title}
                  href={doc.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  style={{
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={12} style={{ color: 'var(--accent-amber)' }} />
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{doc.title}</span>
                  </div>
                  <ExternalLink size={11} style={{ opacity: 0.6 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Item 5: Week 3 Part 1 — Informed & Local Search */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: currentRoute === 'informed' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: currentRoute === 'informed' ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid var(--border-subtle)',
            }}
          >
            <div
              onClick={() => onNavigate('informed', { algo: currentRoute === 'informed' ? currentAlgorithm : 'Best-First-Search' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: 'var(--accent-purple)' }} />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                    Informed & Local Search
                  </span>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>
                    Part 1 • Best-First, Beam & Local Search
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: 'var(--accent-purple)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                }}
              >
                Week 3
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 12, borderLeft: '2px solid rgba(139, 92, 246, 0.25)' }}>
              {[
                { id: 'Best-First-Search', label: 'Best-First-Search', desc: 'h(N) sorting & parent links' },
                { id: 'Beam-Search', label: 'Beam-Search', desc: 'Layer-wise top-w pruning' },
                { id: 'Hill-Climbing', label: 'Hill-Climbing', desc: 'Steepest local descent' },
                { id: 'Variable-Neighbourhood-Descent', label: 'VND', desc: 'Successive move generators' },
                { id: 'Best-Neighbour-Search', label: 'Best-Neighbour', desc: 'Global bestEver tracking' },
                { id: 'Iterated-Hill-Climbing', label: 'Iterated HC', desc: 'N random restarts' },
              ].map((algo) => {
                const isActive = currentRoute === 'informed' && currentAlgorithm === algo.id;
                return (
                  <button
                    key={algo.id}
                    onClick={() => onNavigate('informed', { algo: algo.id })}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                      border: isActive ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid transparent',
                      color: isActive ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{algo.label}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 1 }}>{algo.desc}</div>
                    </div>
                    {isActive ? (
                      <CheckCircle2 size={12} style={{ color: 'var(--accent-purple)' }} />
                    ) : (
                      <ChevronRight size={11} style={{ opacity: 0.4 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item 6: Week 3 Part 2 — Travelling Salesperson Problem (TSP) */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: currentRoute === 'tsp' ? 'rgba(236, 72, 153, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: currentRoute === 'tsp' ? '1px solid rgba(236, 72, 153, 0.35)' : '1px solid var(--border-subtle)',
            }}
          >
            <div
              onClick={() => onNavigate('tsp', { algo: currentRoute === 'tsp' ? currentAlgorithm : 'Savings-Heuristic' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Compass size={16} style={{ color: 'var(--accent-pink, #ec4899)' }} />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                    TSP Heuristics
                  </span>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>
                    Part 2 • Tour Construction
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(236, 72, 153, 0.15)',
                  color: 'var(--accent-pink, #ec4899)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                }}
              >
                Week 3
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 12, borderLeft: '2px solid rgba(236, 72, 153, 0.25)' }}>
              {[
                { id: 'Nearest-Neighbour-Heuristic', label: 'Nearest Neighbour', desc: 'Greedy city hop; cycle & fork checks' },
                { id: 'Greedy-Heuristic', label: 'Greedy Heuristic', desc: 'Edge-cost order; loop prevention' },
                { id: 'Savings-Heuristic', label: 'Savings Heuristic', desc: 'Clarke-Wright base city subtour merges' },
              ].map((algo) => {
                const isActive = currentRoute === 'tsp' && currentAlgorithm === algo.id;
                return (
                  <button
                    key={algo.id}
                    onClick={() => onNavigate('tsp', { algo: algo.id })}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'rgba(236, 72, 153, 0.3)' : 'transparent',
                      border: isActive ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid transparent',
                      color: isActive ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{algo.label}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 1 }}>{algo.desc}</div>
                    </div>
                    {isActive ? (
                      <CheckCircle2 size={12} style={{ color: 'var(--accent-pink, #ec4899)' }} />
                    ) : (
                      <ChevronRight size={11} style={{ opacity: 0.4 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(10, 13, 20, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--text-dim)',
          }}
        >
          <span>Ver. AI-SMPS-2023-W2/W3</span>
          <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Deterministic</span>
        </div>
      </div>
    </div>
  );
};
