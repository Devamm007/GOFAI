import React from 'react'
import type { EdgeProps } from '@xyflow/react'

export interface DirectedEdgeData extends Record<string, unknown> {
  isReciprocal?: boolean
  isPath?: boolean
  isCurrentMoveGen?: boolean
}

const NODE_RADIUS = 30 // Matches 60px diameter node (radius = 30px)
const ARROW_LEN = 11 // Length of arrowhead along approach vector
const ARROW_HALF_WIDTH = 5.5 // Half-width across approach vector (total width = 11px)

export const DirectedStateEdge: React.FC<EdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}) => {
  const edgeData = (data || {}) as DirectedEdgeData
  const {
    isReciprocal = false,
    isPath = false,
    isCurrentMoveGen = false,
  } = edgeData

  const isSelfLoop = source === target

  let edgePath = ''
  let tipX = 0
  let tipY = 0
  let wing1X = 0
  let wing1Y = 0
  let wing2X = 0
  let wing2Y = 0

  if (isSelfLoop) {
    // Elegant circular self-loop above node
    const angStart = -2.18 // ~ -125 deg
    const angEnd = -0.96 // ~ -55 deg

    const sx = sourceX + NODE_RADIUS * Math.cos(angStart)
    const sy = sourceY + NODE_RADIUS * Math.sin(angStart)

    tipX = sourceX + (NODE_RADIUS + 1) * Math.cos(angEnd)
    tipY = sourceY + (NODE_RADIUS + 1) * Math.sin(angEnd)

    const c1x = sourceX - 42
    const c1y = sourceY - 85
    const c2x = sourceX + 42
    const c2y = sourceY - 85

    // Tangent at arrival into tip
    const vx = tipX - c2x
    const vy = tipY - c2y
    const vdist = Math.sqrt(vx * vx + vy * vy) || 1
    const ux = vx / vdist
    const uy = vy / vdist
    const nx = -uy
    const ny = ux

    const baseCenterX = tipX - ARROW_LEN * ux
    const baseCenterY = tipY - ARROW_LEN * uy

    wing1X = baseCenterX + ARROW_HALF_WIDTH * nx
    wing1Y = baseCenterY + ARROW_HALF_WIDTH * ny
    wing2X = baseCenterX - ARROW_HALF_WIDTH * nx
    wing2Y = baseCenterY - ARROW_HALF_WIDTH * ny

    edgePath = `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${baseCenterX} ${baseCenterY}`
  } else {
    // Directed edge between distinct nodes
    const dx = targetX - sourceX
    const dy = targetY - sourceY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 1) {
      return null
    }

    const ux = dx / dist
    const uy = dy / dist
    const nx = -uy
    const ny = ux

    if (isReciprocal) {
      // Reciprocal edge (A <-> B):
      // Displace connection points angularly on the circle perimeter (+20 deg)
      // This guarantees that A->B and B->A NEVER share connection points or overlap!
      const phi = 0.349 // 20 degrees in radians
      const cosPhi = Math.cos(phi)
      const sinPhi = Math.sin(phi)

      // Exit point from source circle
      const dExitX = cosPhi * ux + sinPhi * nx
      const dExitY = cosPhi * uy + sinPhi * ny
      const sx = sourceX + NODE_RADIUS * dExitX
      const sy = sourceY + NODE_RADIUS * dExitY

      // Entry point at target circle perimeter
      const dEntryX = -cosPhi * ux + sinPhi * nx
      const dEntryY = -cosPhi * uy + sinPhi * ny
      tipX = targetX + (NODE_RADIUS + 1) * dEntryX
      tipY = targetY + (NODE_RADIUS + 1) * dEntryY

      // Control point curved to the right along normal vector
      const curveOffset = 40
      const mx = (sourceX + targetX) / 2 + curveOffset * nx
      const my = (sourceY + targetY) / 2 + curveOffset * ny

      // Tangent vector of quadratic curve at arrival (tip)
      const tanX = tipX - mx
      const tanY = tipY - my
      const tanDist = Math.sqrt(tanX * tanX + tanY * tanY) || 1
      const tux = tanX / tanDist
      const tuy = tanY / tanDist
      const tnx = -tuy
      const tny = tux

      // Arrowhead base and wings
      const baseCenterX = tipX - ARROW_LEN * tux
      const baseCenterY = tipY - ARROW_LEN * tuy
      wing1X = baseCenterX + ARROW_HALF_WIDTH * tnx
      wing1Y = baseCenterY + ARROW_HALF_WIDTH * tny
      wing2X = baseCenterX - ARROW_HALF_WIDTH * tnx
      wing2Y = baseCenterY - ARROW_HALF_WIDTH * tny

      // Path ends cleanly at the arrowhead base
      edgePath = `M ${sx} ${sy} Q ${mx} ${my} ${baseCenterX} ${baseCenterY}`
    } else {
      // Clean, straight directed edge
      const sx = sourceX + NODE_RADIUS * ux
      const sy = sourceY + NODE_RADIUS * uy
      tipX = targetX - (NODE_RADIUS + 1) * ux
      tipY = targetY - (NODE_RADIUS + 1) * uy

      const baseCenterX = tipX - ARROW_LEN * ux
      const baseCenterY = tipY - ARROW_LEN * uy
      wing1X = baseCenterX + ARROW_HALF_WIDTH * nx
      wing1Y = baseCenterY + ARROW_HALF_WIDTH * ny
      wing2X = baseCenterX - ARROW_HALF_WIDTH * nx
      wing2Y = baseCenterY - ARROW_HALF_WIDTH * ny

      edgePath = `M ${sx} ${sy} L ${baseCenterX} ${baseCenterY}`
    }
  }

  // Edge styling
  let strokeColor = '#94a3b8'
  let strokeWidth = 2.2
  let strokeDasharray: string | undefined = undefined
  let filter: string | undefined = undefined

  if (isPath) {
    strokeColor = '#22c55e'
    strokeWidth = 3.5
    filter = 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.85))'
  } else if (isCurrentMoveGen) {
    strokeColor = '#c084fc'
    strokeWidth = 2.8
    strokeDasharray = '5 3'
    filter = 'drop-shadow(0 0 6px rgba(192, 132, 252, 0.85))'
  }

  return (
    <g id={id} className="react-flow__edge" style={{ pointerEvents: 'none' }}>
      {/* Edge Path */}
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter,
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />

      {/* Explicit High-Contrast Direction Arrowhead Polygon */}
      <polygon
        points={`${tipX},${tipY} ${wing1X},${wing1Y} ${wing2X},${wing2Y}`}
        fill={strokeColor}
        stroke={strokeColor}
        strokeWidth={1}
        strokeLinejoin="round"
        style={{
          filter,
          transition: 'fill 0.2s',
        }}
      />
    </g>
  )
}
