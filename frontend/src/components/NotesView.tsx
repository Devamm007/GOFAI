import React from 'react';
import type { AppRoute } from '../utils/router';
import {
  BookOpen,
  ArrowLeft,
  ExternalLink,
  Download,
  FileText,
  AlertTriangle,
  Code2,
} from 'lucide-react';

interface NotesViewProps {
  onNavigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ onNavigate }) => {
  const documents = [
    {
      title: 'symbols.pdf',
      version: 'Version 0.3',
      author: 'Prepared by S. Baskaran',
      filePath: '/docs/symbols.pdf',
      summary:
        'Authoritative reference for Lists, Tuples, Cons (:), List Append (++), Pattern Matching, head, tail, and tuple accessors (first, second, third).',
      topics: [
        'Cons operator (:) prepending element to head of list',
        'Append operator (++) concatenating two lists',
        'Tuple structures: (node, parent) and (node, parent, depth)',
        'Take n operator: returns at most n elements from head',
      ],
    },
    {
      title: 'algorithms_week2.pdf',
      version: 'AI SMPS 2023 Week 2',
      author: 'Prepared by S. Baskaran',
      filePath: '/docs/algorithms_week2.pdf',
      summary:
        'Formal pseudocode and execution mechanics for Uninformed State Space Search algorithms: BFS, DFS, DB-DFS, DFID-N, and DFID-C.',
      topics: [
        'Breadth-First Search (Page 4): Queue FIFO & duplicate pruning',
        'Depth-First Search (Page 4): Stack LIFO & neighbor order preservation',
        'Depth-First Iterative Deepening (New Only vs. Closed Reopening)',
        'Ancillary functions: Occurs-In, Remove-Seen, Make-Pairs, Reconstruct-Path',
      ],
    },
    {
      title: 'algorithms_week3.pdf',
      version: 'Ver. 2 (Continuation of Week 2)',
      author: 'Prepared by S. Baskaran',
      filePath: '/docs/algorithms_week3.pdf',
      summary:
        'Formal pseudocode and node-ordering rules for Informed/Heuristic Search: Best-First Search, Hill-Climbing, Beam Search, and TSP Heuristics.',
      topics: [
        'Alphabetical Tie-Breaker (Page 2) for pools of best nodes',
        'Best-First Search (Page 3): sorth(newPairs ++ tail OPEN)',
        'Hill-Climbing (Page 3): Steepest ascent with bestEver check',
        'Beam Search (Page 3): Layered exploration with beam width w',
        'TSP Heuristics (Page 4): Nearest-Neighbour, Greedy, and Savings',
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
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)',
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                margin: 0,
              }}
            >
              Official Specification & Course Notes
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Primary reference documents for IIT Madras AI SMPS (Prof. Deepak Khemani & S. Baskaran)
            </p>
          </div>
        </div>
      </div>

      {/* Tie Breaking Warning Notice */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          marginBottom: 32,
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
        }}
      >
        <AlertTriangle size={20} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong style={{ fontSize: 13, color: '#fef3c7', display: 'block', marginBottom: 4 }}>
            Authoritative Course Node-Ordering & Tie-Breaking Rule (Week 3, Page 2)
          </strong>
          <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
            <em>
              &ldquo;When multiple nodes have the same (best) cost, sort those nodes in
              alphabetical order of node label and select nodes from the head of the sorted list.&rdquo;
            </em>{' '}
            Our engine adheres strictly to this rule to guarantee identical traces with the
            course auto-grader.
          </p>
        </div>
      </div>

      {/* PDF Document Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
        {documents.map((doc) => (
          <div
            key={doc.title}
            className="glass-panel"
            style={{
              padding: 24,
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-indigo)',
                  }}
                >
                  <FileText size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {doc.title}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                    <span>{doc.version}</span> • <span>{doc.author}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <a
                  href={doc.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>Open PDF</span>
                  <ExternalLink size={13} />
                </a>
                <a
                  href={doc.filePath}
                  download
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {doc.summary}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              {doc.topics.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: 'var(--text-main)',
                  }}
                >
                  <Code2 size={13} style={{ color: 'var(--accent-indigo)', flexShrink: 0 }} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Syntax Cheat-Sheet */}
      <div className="glass-panel" style={{ padding: 24, border: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>
          Quick Operational Syntax Reference (symbols.pdf)
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '8px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Symbol</th>
                <th style={{ padding: '8px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '8px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Example</th>
                <th style={{ padding: '8px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Evaluation</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>:</td>
                <td style={{ padding: '8px 12px' }}>Cons operator</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>3 : [2, 1]</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>[3, 2, 1]</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>++</td>
                <td style={{ padding: '8px 12px' }}>Concatenation</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>[a, b] ++ [c, d]</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>[a, b, c, d]</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>head</td>
                <td style={{ padding: '8px 12px' }}>First element</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>head [3, 2, 1]</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>3</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>tail</td>
                <td style={{ padding: '8px 12px' }}>Rest of list</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>tail [3, 2, 1]</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>[2, 1]</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>take n</td>
                <td style={{ padding: '8px 12px' }}>First n elements</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>take 2 [a, b, c]</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>[a, b]</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
