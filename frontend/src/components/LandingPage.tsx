import React from 'react';
import type { AppRoute } from '../utils/router';
import {
  Network,
  Box,
  BookOpen,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  FileText,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '36px 24px 64px',
        maxWidth: 1240,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Hero Section */}
      <section style={{ marginBottom: 40, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 999,
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: 16,
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--accent-indigo)' }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#c7d2fe',
              letterSpacing: '0.03em',
            }}
          >
            IIT Madras • AI: Search Methods for Problem Solving
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            lineHeight: 1.18,
            letterSpacing: '-0.03em',
            marginBottom: 16,
            background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'var(--font-display)',
          }}
        >
          State-Space Search & Heuristic Landscape Lab
        </h1>

        <p
          style={{
            fontSize: 'clamp(14px, 1.6vw, 16px)',
            color: 'var(--text-muted)',
            maxWidth: 740,
            margin: '0 auto 26px',
            lineHeight: 1.6,
          }}
        >
          A unified developer workspace for state-space search algorithms: explore
          code-faithful line-by-line execution, inspect live OPEN/CLOSED data
          structures, interact with 3D heuristic terrains, and study course specifications.
        </p>

        {/* Feature Badges Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: 12,
            }}
          >
            <CheckCircle2 size={15} style={{ color: 'var(--accent-emerald)' }} />
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
              Week 2 Active (BFS • DFS • DFID-N • DFID-C)
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              fontSize: 12,
            }}
          >
            <Box size={15} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
              PA4 3D WebGL Landscape (4 Heuristics)
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              fontSize: 12,
            }}
          >
            <CheckCircle2 size={15} style={{ color: 'var(--accent-purple)' }} />
            <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
              Week 3 Active (Informed, Local Search & TSP)
            </span>
          </div>
        </div>
      </section>

      {/* Primary Four Navigation Cards Grid */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 22,
          marginBottom: 44,
        }}
      >
        {/* Card 1: Uninformed Search Algorithms */}
        <div
          className="glass-panel"
          style={{
            padding: 26,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            border: '1px solid rgba(99, 102, 241, 0.28)',
            background:
              'radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), rgba(15, 23, 42, 0.9) 65%)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.55)';
            e.currentTarget.style.boxShadow = '0 16px 36px -10px rgba(99, 102, 241, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.28)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-indigo)',
                }}
              >
                <Network size={22} />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 999,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--accent-emerald)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Available Now
              </span>
            </div>

            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: 8,
                fontFamily: 'var(--font-display)',
              }}
            >
              Uninformed Search Algorithms
            </h2>

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.55,
                marginBottom: 16,
              }}
            >
              Code-faithful state-space search engine with line-by-line pseudocode
              highlighting, synchronized OPEN/CLOSED tuple lists, and deterministic replay.
            </p>

            {/* Quick Algorithm Switcher Chips */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8,
                marginBottom: 20,
              }}
            >
              {[
                { name: 'BFS', desc: 'Queue FIFO' },
                { name: 'DFS', desc: 'Stack LIFO' },
                { name: 'DFID-N', desc: 'New Only' },
                { name: 'DFID-C', desc: 'Closed Reopen' },
              ].map((algo) => (
                <button
                  key={algo.name}
                  onClick={() => onNavigate('visualizer', { algo: algo.name })}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.35)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{algo.name}</span>
                    <ChevronRight size={12} style={{ color: 'var(--accent-indigo)' }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                    {algo.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('visualizer')}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5, #4338ca)';
              e.currentTarget.style.transform = 'scale(1.01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #4f46e5)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>Launch Visualizer</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Card 2: Heuristic Landscape Visualizer */}
        <div
          className="glass-panel"
          style={{
            padding: 26,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            border: '1px solid rgba(6, 182, 212, 0.28)',
            background:
              'radial-gradient(circle at top right, rgba(6, 182, 212, 0.12), rgba(15, 23, 42, 0.9) 65%)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.55)';
            e.currentTarget.style.boxShadow = '0 16px 36px -10px rgba(6, 182, 212, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.28)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: 'rgba(6, 182, 212, 0.2)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)',
                }}
              >
                <Box size={22} />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 999,
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Interactive 3D
              </span>
            </div>

            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: 8,
                fontFamily: 'var(--font-display)',
              }}
            >
              Heuristic Landscape Visualizer
            </h2>

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.55,
                marginBottom: 16,
              }}
            >
              6-Block Blocks World state space modeled with skyscraper level heights.
              Simulates Hill Climbing with 3D WebGL terrain, 2D contour maps, and state graphs.
            </p>

            {/* Heuristic Functions Breakdown */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                marginBottom: 20,
              }}
            >
              {[
                { label: 'h1', name: 'Misplaced Blocks' },
                { label: 'h2', name: 'Level Structure' },
                { label: 'h3', name: 'Support Stacks' },
                { label: 'h4', name: 'Deep Structural Distance' },
              ].map((h) => (
                <div
                  key={h.label}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--accent-cyan)',
                    }}
                  >
                    {h.label}
                  </span>
                  <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>
                    {h.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <a
            href="/week3-pa4-gemini.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0891b2, #0284c7)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #0e7490, #0369a1)';
              e.currentTarget.style.transform = 'scale(1.01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #0891b2, #0284c7)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>Launch 3D Landscape</span>
            <ExternalLink size={15} />
          </a>
        </div>

        {/* Card 3: Official Week-wise Notes */}
        <div
          className="glass-panel"
          style={{
            padding: 26,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            border: '1px solid rgba(245, 158, 11, 0.28)',
            background:
              'radial-gradient(circle at top right, rgba(245, 158, 11, 0.1), rgba(15, 23, 42, 0.9) 65%)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.55)';
            e.currentTarget.style.boxShadow = '0 16px 36px -10px rgba(245, 158, 11, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.28)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-amber)',
                }}
              >
                <BookOpen size={22} />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 999,
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-amber)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Primary Spec
              </span>
            </div>

            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: 8,
                fontFamily: 'var(--font-display)',
              }}
            >
              Official Course Notes
            </h2>

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.55,
                marginBottom: 16,
              }}
            >
              Primary reference documents defining list/tuple operations (`:`, `++`),
              pseudocode execution rules, and the official alphabetical tie-breaker.
            </p>

            {/* Quick Document Links */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                marginBottom: 20,
              }}
            >
              {[
                { title: 'symbols.pdf', path: '/docs/symbols.pdf' },
                { title: 'algorithms_week2.pdf', path: '/docs/algorithms_week2.pdf' },
                { title: 'algorithms_week3.pdf', path: '/docs/algorithms_week3.pdf' },
              ].map((doc) => (
                <a
                  key={doc.title}
                  href={doc.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#e2e8f0',
                    fontSize: 12,
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.35)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={13} style={{ color: 'var(--accent-amber)' }} />
                    <span>{doc.title}</span>
                  </div>
                  <ExternalLink size={12} style={{ opacity: 0.6 }} />
                </a>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('notes')}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #b45309, #92400e)';
              e.currentTarget.style.transform = 'scale(1.01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #d97706, #b45309)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>Browse Notes & Syntax</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Card 4: Week 3 Part 1 — Informed & Local Search */}
        <div
          className="glass-panel"
          style={{
            padding: 26,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            border: '1px solid rgba(139, 92, 246, 0.28)',
            background:
              'radial-gradient(circle at top right, rgba(139, 92, 246, 0.12), rgba(15, 23, 42, 0.9) 65%)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.55)';
            e.currentTarget.style.boxShadow = '0 16px 36px -10px rgba(139, 92, 246, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.28)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-purple)',
                }}
              >
                <Sparkles size={22} />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 999,
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: 'var(--accent-purple)',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Week 3 Part 1
              </span>
            </div>

            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: 8,
                fontFamily: 'var(--font-display)',
              }}
            >
              Informed & Local Search
            </h2>

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.55,
                marginBottom: 16,
              }}
            >
              Heuristic evaluation using h(N) to guide search. Features Best-First Search
              with alphabetical tie-breaking, bounded Beam Search, and iterative local descent.
            </p>

            {/* Quick Algorithm Switcher Chips */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8,
                marginBottom: 20,
              }}
            >
              {[
                { id: 'Best-First-Search', name: 'Best-First', desc: 'h(N) sorting' },
                { id: 'Beam-Search', name: 'Beam Search', desc: 'top-w pruning' },
                { id: 'Hill-Climbing', name: 'Hill Climbing', desc: 'Steepest move' },
                { id: 'Variable-Neighbourhood-Descent', name: 'VND', desc: 'MoveGen switch' },
                { id: 'Best-Neighbour-Search', name: 'Best Neighbour', desc: 'Global bestEver' },
                { id: 'Iterated-Hill-Climbing', name: 'Iterated HC', desc: 'N restarts' },
              ].map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => onNavigate('informed', { algo: algo.id })}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.35)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{algo.name}</span>
                    <ChevronRight size={11} style={{ opacity: 0.5 }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                    {algo.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('informed')}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9, #5b21b6)';
              e.currentTarget.style.transform = 'scale(1.01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed, #6d28d9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>Launch Informed Search</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Card 5: Week 3 Part 2 — Travelling Salesperson Problem (TSP) */}
        <div
          className="glass-panel"
          style={{
            padding: 26,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            border: '1px solid rgba(236, 72, 153, 0.28)',
            background:
              'radial-gradient(circle at top right, rgba(236, 72, 153, 0.12), rgba(15, 23, 42, 0.9) 65%)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.55)';
            e.currentTarget.style.boxShadow = '0 16px 36px -10px rgba(236, 72, 153, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.28)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: 'rgba(236, 72, 153, 0.2)',
                  border: '1px solid rgba(236, 72, 153, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-pink, #ec4899)',
                }}
              >
                <Compass size={22} />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 999,
                  background: 'rgba(236, 72, 153, 0.15)',
                  color: 'var(--accent-pink, #ec4899)',
                  border: '1px solid rgba(236, 72, 153, 0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Week 3 Part 2
              </span>
            </div>

            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: 8,
                fontFamily: 'var(--font-display)',
              }}
            >
              Travelling Salesperson Problem
            </h2>

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.55,
                marginBottom: 16,
              }}
            >
              Tour construction heuristics for symmetric TSP: Nearest-Neighbour city hopping,
              global Greedy edge-cost sorting, and Clarke-Wright Savings subtour merges.
            </p>

            {/* Quick Algorithm Switcher Chips */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                marginBottom: 20,
              }}
            >
              {[
                { id: 'Nearest-Neighbour-Heuristic', name: 'Nearest Neighbour', desc: 'Greedy city hop; cycle/fork checks' },
                { id: 'Greedy-Heuristic', name: 'Greedy Heuristic', desc: 'Global edge-cost order; loop prevention' },
                { id: 'Savings-Heuristic', name: 'Savings (Clarke-Wright)', desc: 'Base city subtour merges by savings' },
              ].map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => onNavigate('tsp', { algo: algo.id })}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.35)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{algo.name}</span>
                    <ChevronRight size={11} style={{ opacity: 0.5 }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                    {algo.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('tsp')}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #db2777, #be185d)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(219, 39, 119, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #be185d, #9d174d)';
              e.currentTarget.style.transform = 'scale(1.01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #db2777, #be185d)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>Launch TSP Visualizer</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section
        className="glass-panel"
        style={{
          padding: '22px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          background: 'rgba(15, 23, 42, 0.75)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ShieldCheck size={28} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Auto-Grader Faithful Execution Guarantee
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '3px 0 0' }}>
              All algorithm operations, successor ordering, OPEN/CLOSED maintenance, and tie-breaking
              rules match official IIT Madras auto-grader specifications.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => onNavigate('visualizer')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Launch Visualizer
          </button>
          <a
            href="/week3-pa4-gemini.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(6, 182, 212, 0.2)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: 'var(--accent-cyan)',
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>3D Landscape</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </section>
    </div>
  );
};
