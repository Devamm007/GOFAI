import React, { useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import type { Edge, Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CustomNode } from './CustomNode'
import type { CustomNodeData } from './CustomNode'
import { DirectedStateEdge } from './DirectedStateEdge'
import type { DirectedEdgeData } from './DirectedStateEdge'
import type { GraphData, TraceEvent } from '../types'
import { computeHierarchicalLayout, computeCircularLayout } from '../utils/layout'
import type { LayoutMode } from '../utils/layout'
import { GitBranch, Orbit, Maximize2, Info, ChevronDown, ChevronUp } from 'lucide-react'

const nodeTypes = {
  custom: CustomNode,
}

const edgeTypes = {
  directed: DirectedStateEdge,
}

interface GraphCanvasProps {
  graph: GraphData
  currentEvent?: TraceEvent | null
  finalPath?: string[] | null
  selectedNodeId?: string | null
  onSelectNode?: (nodeId: string | null) => void
}

const InnerGraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  currentEvent,
  finalPath,
  selectedNodeId,
  onSelectNode,
}) => {
  const { fitView } = useReactFlow()
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('hierarchical')
  const [isLegendOpen, setIsLegendOpen] = useState(true)

  // Extract node sets from current trace event
  const { inspectedNode, openNodeSet, closedNodeSet, pathNodeSet, pathEdgesSet, currentMoveGenEdges } = useMemo(() => {
    const inspectedNode = currentEvent?.current_node || null
    const openNodeSet = new Set<string>()
    if (currentEvent?.open_after) {
      for (const item of currentEvent.open_after) {
        if (Array.isArray(item) && item.length > 0) openNodeSet.add(item[0])
      }
    }

    const closedNodeSet = new Set<string>()
    if (currentEvent?.closed_after) {
      for (const item of currentEvent.closed_after) {
        if (Array.isArray(item) && item.length > 0) closedNodeSet.add(item[0])
      }
    }

    const activePath = currentEvent?.path || (currentEvent?.is_terminal && finalPath ? finalPath : null)
    const pathNodeSet = new Set<string>(activePath || [])
    const pathEdgesSet = new Set<string>()
    if (activePath && activePath.length > 1) {
      for (let i = 0; i < activePath.length - 1; i++) {
        pathEdgesSet.add(`${activePath[i]}->${activePath[i + 1]}`)
      }
    }

    const currentMoveGenEdges = new Set<string>()
    if (currentEvent?.current_node && currentEvent?.raw_neighbours) {
      for (const nbr of currentEvent.raw_neighbours) {
        currentMoveGenEdges.add(`${currentEvent.current_node}->${nbr}`)
      }
    }

    return { inspectedNode, openNodeSet, closedNodeSet, pathNodeSet, pathEdgesSet, currentMoveGenEdges }
  }, [currentEvent, finalPath])

  // Check reciprocal edges in graph definition: A->B and B->A
  const reciprocalEdgeSet = useMemo(() => {
    const set = new Set<string>()
    for (const [src, targets] of Object.entries(graph.edges)) {
      for (const tgt of targets) {
        if (graph.edges[tgt] && graph.edges[tgt].includes(src)) {
          set.add(`${src}->${tgt}`)
          set.add(`${tgt}->${src}`)
        }
      }
    }
    return set
  }, [graph.edges])

  // Compute node positions using selected layout algorithm
  const nodePositions = useMemo(() => {
    if (layoutMode === 'hierarchical') {
      return computeHierarchicalLayout(graph)
    }
    return computeCircularLayout(graph)
  }, [graph, layoutMode])

  // Nodes list
  const nodes: Node<CustomNodeData>[] = useMemo(() => {
    return graph.nodes.map((nodeId) => {
      const isStart = nodeId === graph.start_node
      const isGoal = nodeId === graph.goal_node
      const isInspected = nodeId === inspectedNode
      const isPath = pathNodeSet.has(nodeId)
      const isInOpen = openNodeSet.has(nodeId)
      const isInClosed = closedNodeSet.has(nodeId)
      const isSelected = nodeId === selectedNodeId

      let status: CustomNodeData['status'] = 'idle'
      let badgeText: string | undefined = undefined

      // Non-color priority hierarchy
      if (isInspected) {
        status = 'inspected'
        badgeText = 'INSPECT'
      } else if (isPath) {
        status = 'path'
        badgeText = isStart ? 'START' : isGoal ? 'GOAL' : 'PATH'
      } else if (isInOpen) {
        status = 'frontier'
        badgeText = 'OPEN'
      } else if (isInClosed) {
        status = 'closed'
        badgeText = isStart ? 'START' : 'CLOSED'
      } else if (isStart) {
        status = 'start'
        badgeText = 'START'
      } else if (isGoal) {
        status = 'goal'
        badgeText = 'GOAL'
      }

      // Depth for current inspected or open item if available
      let depth: number | null = null
      if (isInspected && currentEvent?.current_depth !== undefined && currentEvent?.current_depth !== null) {
        depth = currentEvent.current_depth
      }

      const pos = nodePositions[nodeId] || { x: 300, y: 300 }

      return {
        id: nodeId,
        type: 'custom',
        position: pos,
        data: {
          label: nodeId,
          status,
          isStart,
          isGoal,
          badgeText,
          successors: graph.edges[nodeId] || [],
          isSelected,
          depth,
        },
      }
    })
  }, [graph, inspectedNode, openNodeSet, closedNodeSet, pathNodeSet, selectedNodeId, nodePositions, currentEvent])

  // Edges list with exact boundary calculations, reciprocal curves, and arrowheads
  const edges: Edge<DirectedEdgeData>[] = useMemo(() => {
    const result: Edge<DirectedEdgeData>[] = []

    for (const [src, targets] of Object.entries(graph.edges)) {
      const sortedTargets = [...targets].sort()
      sortedTargets.forEach((tgt, idx) => {
        const edgeKey = `${src}->${tgt}`
        const isPathEdge = pathEdgesSet.has(edgeKey)
        const isCurrentMoveGen = currentMoveGenEdges.has(edgeKey)
        const isReciprocal = reciprocalEdgeSet.has(edgeKey)

        result.push({
          id: `edge-${src}-${tgt}-${idx}`,
          source: src,
          target: tgt,
          sourceHandle: 'source',
          targetHandle: 'target',
          type: 'directed',
          data: {
            isReciprocal,
            isPath: isPathEdge,
            isCurrentMoveGen,
          },
        })
      })
    }

    return result
  }, [graph.edges, pathEdgesSet, currentMoveGenEdges, reciprocalEdgeSet])

  const selectedNodeData = selectedNodeId
    ? {
        id: selectedNodeId,
        isStart: selectedNodeId === graph.start_node,
        isGoal: selectedNodeId === graph.goal_node,
        inOpen: openNodeSet.has(selectedNodeId),
        inClosed: closedNodeSet.has(selectedNodeId),
        successors: graph.edges[selectedNodeId] || [],
      }
    : null

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Floating Canvas Top Toolbar (Layout Mode & View Fit) */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 10,
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.9)',
        }}
      >
        <button
          className="btn btn-secondary"
          style={{
            padding: '5px 10px',
            fontSize: 12,
            background: layoutMode === 'hierarchical' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: layoutMode === 'hierarchical' ? '1px solid var(--accent-indigo)' : '1px solid transparent',
            color: layoutMode === 'hierarchical' ? '#ffffff' : '#94a3b8',
          }}
          onClick={() => {
            setLayoutMode('hierarchical')
            setTimeout(() => fitView({ duration: 400 }), 50)
          }}
          title="Hierarchical Flow (Sugiyama DAG): Left-to-right state progression with minimized crossings"
        >
          <GitBranch size={14} />
          <span>Flow Layout</span>
        </button>

        <button
          className="btn btn-secondary"
          style={{
            padding: '5px 10px',
            fontSize: 12,
            background: layoutMode === 'circular' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: layoutMode === 'circular' ? '1px solid var(--accent-indigo)' : '1px solid transparent',
            color: layoutMode === 'circular' ? '#ffffff' : '#94a3b8',
          }}
          onClick={() => {
            setLayoutMode('circular')
            setTimeout(() => fitView({ duration: 400 }), 50)
          }}
          title="Circular Layout: Radial distribution for mesh topologies"
        >
          <Orbit size={14} />
          <span>Circular</span>
        </button>

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />

        <button
          className="btn btn-secondary btn-icon"
          style={{ width: 30, height: 30 }}
          onClick={() => fitView({ duration: 400, padding: 0.2 })}
          title="Fit view to screen"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {/* Main React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode="dark"
        onNodeClick={(_, node) => {
          if (onSelectNode) {
            onSelectNode(selectedNodeId === node.id ? null : node.id)
          }
        }}
        onPaneClick={() => {
          if (onSelectNode) onSelectNode(null)
        }}
        fitView
        attributionPosition="bottom-right"
        style={{ background: 'transparent' }}
        minZoom={0.2}
        maxZoom={2.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="rgba(255, 255, 255, 0.08)" />
        <Controls
          position="top-right"
          showInteractive={true}
        />
        <MiniMap
          nodeColor={(node) => {
            const d = node.data as unknown as CustomNodeData
            if (d?.status === 'inspected') return '#c084fc'
            if (d?.status === 'path') return '#22c55e'
            if (d?.status === 'frontier') return '#06b6d4'
            if (d?.status === 'closed') return '#ef4444'
            if (d?.isStart) return '#10b981'
            if (d?.isGoal) return '#f59e0b'
            return '#1e293b'
          }}
          maskColor="rgba(10, 13, 20, 0.7)"
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 8,
          }}
        />
      </ReactFlow>

      {/* Selected Node Details Floating Card (Inspector) */}
      {selectedNodeData && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 60,
            left: 14,
            padding: '12px 16px',
            zIndex: 10,
            maxWidth: 280,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#ffffff' }}>
              <Info size={14} style={{ color: 'var(--accent-indigo)' }} />
              <span>Node Inspector</span>
            </div>
            <button
              onClick={() => onSelectNode && onSelectNode(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}
            >
              ×
            </button>
          </div>

          <div style={{ fontSize: 12, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#f8fafc' }}>
              Node {selectedNodeData.id}
            </span>
            {selectedNodeData.isStart && (
              <span className="pill-tag" style={{ color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}>
                Start
              </span>
            )}
            {selectedNodeData.isGoal && (
              <span className="pill-tag" style={{ color: 'var(--accent-amber)', borderColor: 'var(--accent-amber)' }}>
                Goal
              </span>
            )}
          </div>

          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>
            Status:{' '}
            <strong style={{ color: '#e2e8f0' }}>
              {selectedNodeData.id === inspectedNode
                ? 'Currently Inspected'
                : selectedNodeData.inOpen
                ? 'In OPEN (Frontier)'
                : selectedNodeData.inClosed
                ? 'In CLOSED (Explored)'
                : 'Unvisited'}
            </strong>
          </div>

          {/* Neighbours list in alphabetical order */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>
              Neighbours (Alphabetical):
            </div>
            {selectedNodeData.successors.length === 0 ? (
              <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
                [] (No outgoing neighbours)
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {selectedNodeData.successors.map((succ) => (
                  <span
                    key={`succ-${succ}`}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#e2e8f0',
                    }}
                  >
                    {succ}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Canvas Legend (Collapsible) */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          padding: '8px 12px',
          zIndex: 5,
          background: 'rgba(15, 23, 42, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 700,
            color: '#94a3b8',
          }}
        >
          <span>Visual Legend</span>
          {isLegendOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>

        {isLegendOpen && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', border: '1px solid #ffffff' }} />
              Start
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', border: '1px solid #ffffff' }} />
              Goal
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#c084fc', boxShadow: '0 0 6px #c084fc' }} />
              Inspected
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0e7490', border: '1.5px dashed #06b6d4' }} />
              Frontier (OPEN)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
              Closed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              Path
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export const GraphCanvas: React.FC<GraphCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <InnerGraphCanvas {...props} />
    </ReactFlowProvider>
  )
}
