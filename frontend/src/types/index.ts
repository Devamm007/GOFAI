export interface GraphData {
  nodes: string[]
  edges: Record<string, string[]>
  start_node: string
  goal_node: string
  metadata?: Record<string, any>
}

export interface TraceEvent {
  step_index: number
  algorithm: string
  line_number: number
  line_pseudocode: string
  event_type: string
  description: string
  
  current_node?: string | null
  current_parent?: string | null
  current_depth?: number | null
  
  depth_bound?: number | null
  iteration?: number | null
  
  open_before: any[]
  open_after: any[]
  open_size_before: number
  open_size_after: number
  
  closed_before: any[]
  closed_after: any[]
  closed_size_before: number
  closed_size_after: number
  
  raw_neighbours?: string[] | null
  filtered_nodes?: string[] | null
  new_pairs?: any[] | null
  
  count?: number | null
  previous_count?: number | null
  
  path?: string[] | null
  is_terminal: boolean
  terminal_status?: string | null
  terminal_reason?: string | null
}

export interface SearchRunResponse {
  run_id?: string | null
  algorithm: string
  start_node: string
  goal_node: string
  found_goal: boolean
  path: string[]
  total_steps: number
  nodes_expanded: number
  terminal_status: string
  terminal_reason: string
  spec_version: string
  trace_version: string
  events: TraceEvent[]
}

export interface RunSummary {
  id: string
  algorithm: string
  start_node: string
  goal_node: string
  found_goal: boolean
  path: string[]
  total_steps: number
  nodes_expanded: number
  terminal_status: string
  created_at: string
}

export interface TSPTraceEvent {
  step_index: number
  algorithm: string
  line_number: number
  line_pseudocode: string
  event_type: string
  description: string
  current_city?: string | null
  candidate_edges?: any[] | null
  selected_edge?: any | null
  current_tour?: string[] | null
  sub_tours?: string[][] | null
  savings_list?: [string, string, number][] | null
  total_cost?: number
  is_terminal?: boolean
}

export interface TSPResult {
  algorithm: string
  cities: string[]
  tour: string[]
  total_cost: number
  total_steps: number
  events: TSPTraceEvent[]
}

