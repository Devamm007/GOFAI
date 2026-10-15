import React from 'react'
import type { TraceEvent } from '../types'
import { Code2, ArrowRight } from 'lucide-react'

interface PseudocodePanelProps {
  algorithm: string
  currentEvent?: TraceEvent | null
}

const PSEUDOCODE_LINES: Record<string, { num: number; code: string }[]> = {
  BFS: [
    { num: 1, code: 'OPEN ← (S, null) : []' },
    { num: 2, code: 'CLOSED ← empty list' },
    { num: 3, code: 'while OPEN is not empty' },
    { num: 4, code: '  nodePair ← head OPEN' },
    { num: 5, code: '  (N, _) ← nodePair' },
    { num: 6, code: '  if GoalTest(N) = TRUE' },
    { num: 7, code: '    return ReconstructPath(nodePair, CLOSED)' },
    { num: 8, code: '  else CLOSED ← nodePair : CLOSED' },
    { num: 9, code: '    neighbours ← MoveGen(N)' },
    { num: 10, code: '    newNodes ← RemoveSeen(neighbours, OPEN, CLOSED)' },
    { num: 11, code: '    newPairs ← MakePairs(newNodes, N)' },
    { num: 12, code: '    OPEN ← (tail OPEN) ++ newPairs' },
    { num: 13, code: 'return empty list' },
  ],
  DFS: [
    { num: 1, code: 'OPEN ← (S, null) : []' },
    { num: 2, code: 'CLOSED ← empty list' },
    { num: 3, code: 'while OPEN is not empty' },
    { num: 4, code: '  nodePair ← head OPEN' },
    { num: 5, code: '  (N, _) ← nodePair' },
    { num: 6, code: '  if GoalTest(N) = TRUE' },
    { num: 7, code: '    return ReconstructPath(nodePair, CLOSED)' },
    { num: 8, code: '  else CLOSED ← nodePair : CLOSED' },
    { num: 9, code: '    neighbours ← MoveGen(N)' },
    { num: 10, code: '    newNodes ← RemoveSeen(neighbours, OPEN, CLOSED)' },
    { num: 11, code: '    newPairs ← MakePairs(newNodes, N)' },
    { num: 12, code: '    OPEN ← newPairs ++ (tail OPEN)' },
    { num: 13, code: 'return empty list' },
  ],
  'DFID-N': [
    { num: 1, code: 'count ← -1 ; path ← [] ; depthBound ← 0' },
    { num: 4, code: 'repeat' },
    { num: 5, code: '  previousCount ← count' },
    { num: 6, code: '  (count, path) ← DB-DFS-N(S, depthBound)' },
    { num: 7, code: '  depthBound ← depthBound + 1' },
    { num: 8, code: 'until (path is not empty) or (previousCount = count)' },
    { num: 9, code: 'return path' },
    { num: 10, code: 'DB-DFS-N: count ← 0 ; OPEN ← (S, null, 0):[] ; CLOSED ← []' },
    { num: 13, code: 'while OPEN is not empty' },
    { num: 14, code: '  nodePair ← head OPEN ; (N, _, depth) ← nodePair' },
    { num: 16, code: '  if GoalTest(N) = TRUE return (count, ReconstructPath)' },
    { num: 18, code: '  else CLOSED ← nodePair : CLOSED' },
    { num: 19, code: '    if depth < depthBound' },
    { num: 20, code: '      neighbours ← MoveGen(N)' },
    { num: 21, code: '      newNodes ← RemoveSeen(neighbours, OPEN, CLOSED)' },
    { num: 22, code: '      newPairs ← MakePairs(newNodes, N, depth + 1)' },
    { num: 23, code: '      OPEN ← newPairs ++ tail OPEN' },
    { num: 24, code: '      count ← count + length newPairs' },
    { num: 25, code: '    else OPEN ← tail OPEN' },
    { num: 26, code: 'return (count, empty list)' },
  ],
  'DFID-C': [
    { num: 1, code: 'count ← -1 ; path ← [] ; depthBound ← 0' },
    { num: 4, code: 'repeat' },
    { num: 5, code: '  previousCount ← count' },
    { num: 6, code: '  (count, path) ← DB-DFS-C(S, depthBound)' },
    { num: 7, code: '  depthBound ← depthBound + 1' },
    { num: 8, code: 'until (path is not empty) or (previousCount = count)' },
    { num: 9, code: 'return path' },
    { num: 10, code: 'DB-DFS-C: count ← 0 ; OPEN ← (S, null, 0):[] ; CLOSED ← []' },
    { num: 13, code: 'while OPEN is not empty' },
    { num: 14, code: '  nodePair ← head OPEN ; (N, _, depth) ← nodePair' },
    { num: 16, code: '  if GoalTest(N) = TRUE return (count, ReconstructPath)' },
    { num: 18, code: '  else CLOSED ← nodePair : CLOSED' },
    { num: 19, code: '    if depth < depthBound' },
    { num: 20, code: '      neighbours ← MoveGen(N)' },
    { num: 21, code: '      newNodes ← RemoveSeen(neighbours, OPEN, [])  ▷ Reopen CLOSED' },
    { num: 22, code: '      newPairs ← MakePairs(newNodes, N, depth + 1)' },
    { num: 23, code: '      OPEN ← newPairs ++ tail OPEN' },
    { num: 24, code: '      count ← count + length newPairs' },
    { num: 25, code: '    else OPEN ← tail OPEN' },
    { num: 26, code: 'return (count, empty list)' },
  ],
}

export const PseudocodePanel: React.FC<PseudocodePanelProps> = ({
  algorithm,
  currentEvent,
}) => {
  const lines = PSEUDOCODE_LINES[algorithm] || PSEUDOCODE_LINES.BFS
  const activeLineNumber = currentEvent?.line_number

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#a855f7' }}>
          <Code2 size={16} />
          <span>AUTHORITATIVE PSEUDOCODE ({algorithm})</span>
        </div>
        {activeLineNumber && (
          <span
            className="pill-tag"
            style={{ color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.3)' }}
          >
            Line {activeLineNumber}
          </span>
        )}
      </div>

      {/* Current Step Description Card */}
      {currentEvent && (
        <div
          style={{
            padding: '8px 10px',
            marginBottom: 8,
            borderRadius: 6,
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            fontSize: 12,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <ArrowRight size={14} style={{ color: 'var(--accent-indigo)', marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#e0e7ff', marginBottom: 2 }}>
              {currentEvent.event_type}
            </div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>
              {currentEvent.description}
            </div>
          </div>
        </div>
      )}

      {/* Code Listing */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {lines.map((item) => {
          const isActive = item.num === activeLineNumber
          return (
            <div
              key={`line-${item.num}-${item.code}`}
              className={`code-line ${isActive ? 'active-line' : ''}`}
            >
              <span className="line-num">{item.num}</span>
              <span style={{ whiteSpace: 'pre-wrap' }}>{item.code}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
