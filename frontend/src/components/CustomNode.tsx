import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Flag, Star, Eye, Layers, Check, Footprints } from 'lucide-react'

export interface CustomNodeData extends Record<string, unknown> {
  label: string
  status: 'start' | 'goal' | 'inspected' | 'frontier' | 'closed' | 'path' | 'idle'
  isStart?: boolean
  isGoal?: boolean
  badgeText?: string
  successors?: string[]
  isSelected?: boolean
  depth?: number | null
}

export const CustomNode: React.FC<{ data: CustomNodeData }> = ({ data }) => {
  const { label, status, isStart, isGoal, badgeText, successors, isSelected, depth } = data

  // Determine state class and icons for non-color accessibility cues
  let statusClass = 'node-idle'
  let IconComponent: React.ComponentType<{ size: number; color?: string }> | null = null

  if (status === 'inspected') {
    statusClass = 'node-inspected'
    IconComponent = Eye
  } else if (status === 'path') {
    statusClass = 'node-path'
    IconComponent = Footprints
  } else if (status === 'frontier') {
    statusClass = 'node-frontier'
    IconComponent = Layers
  } else if (status === 'closed') {
    statusClass = 'node-closed'
    IconComponent = Check
  } else if (isStart) {
    statusClass = 'node-start'
    IconComponent = Flag
  } else if (isGoal) {
    statusClass = 'node-goal'
    IconComponent = Star
  }

  return (
    <div
      className={`custom-node ${statusClass} ${isSelected ? 'node-selected' : ''}`}
      style={{
        width: 60,
        height: 60,
        cursor: 'pointer',
      }}
      title={
        successors && successors.length > 0
          ? `Node ${label} | Neighbours = [${[...successors].sort().join(', ')}]`
          : `Node ${label} (Terminal / No outgoing neighbours)`
      }
    >
      {/* Centered handles for exact geometric boundary calculations */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 2,
          height: 2,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="source"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 2,
          height: 2,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Main Node Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <span style={{ fontSize: 18, fontWeight: 800 }}>{label}</span>
      </div>

      {/* Depth indicator if present */}
      {depth !== undefined && depth !== null && (
        <span
          style={{
            position: 'absolute',
            bottom: -6,
            fontSize: 9,
            fontWeight: 700,
            fontFamily: 'JetBrains Mono',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '1px 4px',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#cbd5e1',
          }}
        >
          d:{depth}
        </span>
      )}

      {/* Status Badge with Icon (Non-color cue for accessibility) */}
      {badgeText && (
        <span
          className={`node-badge ${
            status === 'inspected'
              ? 'badge-inspected'
              : status === 'path'
              ? 'badge-path'
              : isStart
              ? 'badge-start'
              : isGoal
              ? 'badge-goal'
              : status === 'frontier'
              ? 'badge-frontier'
              : 'badge-closed'
          }`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {IconComponent && <IconComponent size={9} />}
          <span>{badgeText}</span>
        </span>
      )}
    </div>
  )
}
