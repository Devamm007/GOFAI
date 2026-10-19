import React from 'react';
import type { AppRoute } from '../utils/router';
import {
  Sparkles,
  ArrowLeft,
  Clock,
  CheckCircle2,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface InformedComingSoonViewProps {
  onNavigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export const InformedComingSoonView: React.FC<InformedComingSoonViewProps> = ({
  onNavigate,
}) => {
  const algorithms = [
    {
      name: 'Best-First-Search(S)',
      page: 'Week 3, Page 3',
      status: 'Specification Verified',
      summary:
        'Cost-based evaluation using h(N) to sort OPEN list. Prunes seen nodes in OPEN and CLOSED. Ties broken alphabetically.',
      pseudocode: [
        '1  OPEN ← (S, null, h(S)) :: []',
        '2  CLOSED ← empty list',
        '3  while OPEN is not empty',
        '4    nodePair ← head OPEN',
        '5    (N, _, _) ← nodePair',
        '6    if GoalTest(N) = true',
        '7      return ReconstructPath(nodePair, CLOSED)',
        '8    else CLOSED ← nodePair :: CLOSED',
        '9      neighbours ← MoveGen(N)',
        '10     newNodes ← RemoveSeen(neighbours, OPEN, CLOSED)',
        '11     newPairs ← MakePairs(newNodes, N)',
        '12     OPEN ← sorth(newPairs ++ tail OPEN)',
        '13 return empty list',
      ],
    },
    {
      name: 'Hill-Climbing(S)',
      page: 'Week 3, Page 3',
      status: 'Specification Verified',
      summary:
        'Local search selecting head of sorth MoveGen(bestEver). Terminates at local peaks or plateaus where no neighbor strictly improves heuristic value.',
      pseudocode: [
        '1  N ← S',
        '2  do',
        '     bestEver ← N',
        '3    N ← head sorth MoveGen(bestEver)',
        '4  while h(N) is better than h(bestEver)',
        '5  return bestEver',
      ],
    },
    {
      name: 'Beam-Search(S, w)',
      page: 'Week 3, Page 3',
      status: 'Specification Verified',
      summary:
        'Bounded layer-based search. Generates all successors from OPEN, sorts them by heuristic value, and retains only at most w best candidates via take w.',
      pseudocode: [
        '1  OPEN ← S :: []',
        '2  N ← S',
        '3  do',
        '     bestEver ← N',
        '4    if OPEN contains goal node',
        '5      return that goal node',
        '6    else neighbours ← Move-Gen(OPEN)',
        '7    OPEN ← take w (sorth neighbours)',
        '8    N ← head OPEN  ▷ best in new layer',
        '9  while h(N) is better than h(bestEver)',
        '10 return bestEver',
      ],
    },
    {
      name: 'Variable-Neighbourhood-Descent(S)',
      page: 'Week 3, Page 3',
      status: 'Specification Verified',
      summary:
        'Iteratively switches neighborhood move generators (MoveGen1, MoveGen2, ...) when hill climbing reaches a local optimum.',
      pseudocode: [
        '1  MoveGenList ← MoveGen1 :: MoveGen2 :: ... :: MoveGenn :: []',
        '2  bestNode ← S',
        '3  while MoveGenList is not empty',
        '4    bestNode ← Hill-Climbing(bestNode, head MoveGenList)',
        '5    MoveGenList ← tail MoveGenList',
        '6  return bestNode',
      ],
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 24px 60px',
        maxWidth: 1100,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Back button */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => onNavigate('landing')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Lab Overview</span>
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-purple)',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#ffffff',
                  fontFamily: 'var(--font-display)',
                  margin: 0,
                }}
              >
                Informed Search Algorithms
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-amber)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                Coming Soon • In Development
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Week 3 Heuristic Search Suite (Best-First, Hill-Climbing, Beam Search, VND)
            </p>
          </div>
        </div>
      </div>

      {/* Verification Notice Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 22px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          marginBottom: 36,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', maxWidth: 680 }}>
          <Clock size={20} style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ fontSize: 13, color: '#f3e8ff', display: 'block', marginBottom: 4 }}>
              Specification Verification Status
            </strong>
            <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              The pseudocode below has been fully extracted and decoded from{' '}
              <a href="/docs/algorithms_week3.pdf" style={{ color: 'var(--accent-cyan)' }} target="_blank" rel="noopener noreferrer">
                algorithms_week3.pdf
              </a>
              . The interactive execution engine, heuristic node annotations, and tie-breaking trace generators
              are currently in the verification pipeline.
            </p>
          </div>
        </div>

        <a
          href="/week3-pa4-gemini.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '9px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #0891b2, #0284c7)',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>Explore 3D Blocks World</span>
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Algorithms Specification Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {algorithms.map((algo) => (
          <div
            key={algo.name}
            className="glass-panel"
            style={{
              padding: 24,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Code2 size={18} style={{ color: 'var(--accent-purple)' }} />
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  {algo.name}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  {algo.page}
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <CheckCircle2 size={13} />
                <span>{algo.status}</span>
              </span>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
              {algo.summary}
            </p>

            {/* Pseudocode snippet container */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: '#e2e8f0',
                lineHeight: 1.7,
                overflowX: 'auto',
              }}
            >
              {algo.pseudocode.map((line, idx) => (
                <div key={idx} style={{ whiteSpace: 'pre' }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
