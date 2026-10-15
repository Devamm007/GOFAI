import type { GraphData } from '../types'

export interface NodePosition {
  x: number
  y: number
}

export type LayoutMode = 'hierarchical' | 'circular'

/**
 * Compute deterministic hierarchical left-to-right state-space layout.
 * Organizes nodes in topological levels based on shortest distance from start_node.
 */
export function computeHierarchicalLayout(
  graph: GraphData,
  canvasWidth: number = 800,
  canvasHeight: number = 550,
): Record<string, NodePosition> {
  const positions: Record<string, NodePosition> = {}
  const { nodes, edges, start_node } = graph

  // 1. Compute BFS levels from start_node
  const levels: Record<string, number> = {}
  const queue: string[] = [start_node]
  levels[start_node] = 0

  while (queue.length > 0) {
    const curr = queue.shift()!
    const currLevel = levels[curr]
    const neighbors = edges[curr] || []
    for (const nbr of neighbors) {
      if (levels[nbr] === undefined) {
        levels[nbr] = currLevel + 1
        queue.push(nbr)
      }
    }
  }

  // 2. Identify max reachable level
  let maxLevel = 0
  for (const lvl of Object.values(levels)) {
    if (lvl > maxLevel) maxLevel = lvl
  }

  // 3. For any disconnected / unreachable nodes, assign them to a level below or at maxLevel + 1
  for (const node of nodes) {
    if (levels[node] === undefined) {
      levels[node] = maxLevel + 1
    }
  }

  // 4. Group nodes by level
  const levelGroups: Record<number, string[]> = {}
  for (const node of nodes) {
    const lvl = levels[node]
    if (!levelGroups[lvl]) levelGroups[lvl] = []
    levelGroups[lvl].push(node)
  }

  const sortedLevels = Object.keys(levelGroups)
    .map(Number)
    .sort((a, b) => a - b)

  const numLevels = sortedLevels.length
  const horizontalSpacing = Math.max(180, Math.min(260, (canvasWidth - 160) / Math.max(1, numLevels - 1)))
  const startX = 90
  const centerY = canvasHeight / 2

  // 5. Assign coordinates
  sortedLevels.forEach((lvl, lvlIdx) => {
    const group = levelGroups[lvl]
    // Keep goal node or start node centered if single
    const count = group.length
    const verticalSpacing = Math.max(110, Math.min(160, (canvasHeight - 140) / Math.max(1, count)))
    const x = startX + lvlIdx * horizontalSpacing

    group.forEach((node, idxInLvl) => {
      const y = centerY + (idxInLvl - (count - 1) / 2) * verticalSpacing
      positions[node] = { x, y }
    })
  })

  return positions
}

/**
 * Compute deterministic circular layout.
 */
export function computeCircularLayout(
  graph: GraphData,
  centerX: number = 420,
  centerY: number = 290,
): Record<string, NodePosition> {
  const positions: Record<string, NodePosition> = {}
  const count = graph.nodes.length
  const radius = Math.max(150, count * 34)

  graph.nodes.forEach((nodeId, idx) => {
    const angle = (idx / count) * 2 * Math.PI - Math.PI / 2
    const x = centerX + radius * 1.35 * Math.cos(angle)
    const y = centerY + radius * 0.95 * Math.sin(angle)
    positions[nodeId] = { x, y }
  })

  return positions
}
