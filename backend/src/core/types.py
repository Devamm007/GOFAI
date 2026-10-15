from typing import Any, List, Optional, Tuple, Union
from pydantic import BaseModel, Field


class NodePair(BaseModel):
    node: str
    parent: Optional[str]

    def to_tuple(self) -> Tuple[str, Optional[str]]:
        return (self.node, self.parent)

    def display(self) -> str:
        p = self.parent if self.parent is not None else "null"
        return f"({self.node}, {p})"


class NodeTriple(BaseModel):
    node: str
    parent: Optional[str]
    depth: int

    def to_tuple(self) -> Tuple[str, Optional[str], int]:
        return (self.node, self.parent, self.depth)

    def display(self) -> str:
        p = self.parent if self.parent is not None else "null"
        return f"({self.node}, {p}, {self.depth})"


TupleItem = Union[Tuple[str, Optional[str]], Tuple[str, Optional[str], int], List[Any]]


class TraceEvent(BaseModel):
    step_index: int
    algorithm: str
    line_number: int
    line_pseudocode: str
    event_type: str
    description: str
    
    current_node: Optional[str] = None
    current_parent: Optional[str] = None
    current_depth: Optional[int] = None
    
    depth_bound: Optional[int] = None
    iteration: Optional[int] = None
    
    open_before: List[Any] = Field(default_factory=list)
    open_after: List[Any] = Field(default_factory=list)
    open_size_before: int = 0
    open_size_after: int = 0
    
    closed_before: List[Any] = Field(default_factory=list)
    closed_after: List[Any] = Field(default_factory=list)
    closed_size_before: int = 0
    closed_size_after: int = 0
    
    raw_neighbours: Optional[List[str]] = None
    filtered_nodes: Optional[List[str]] = None
    new_pairs: Optional[List[Any]] = None
    
    count: Optional[int] = None
    previous_count: Optional[int] = None
    
    path: Optional[List[str]] = None
    is_terminal: bool = False
    terminal_status: Optional[str] = None  # "SUCCESS", "FAILURE", "MAX_DEPTH_REACHED"
    terminal_reason: Optional[str] = None


class SearchResult(BaseModel):
    algorithm: str
    start_node: str
    goal_node: str
    found_goal: bool
    path: List[str]
    total_steps: int
    nodes_expanded: int
    events: List[TraceEvent]
    terminal_status: str
    terminal_reason: str
