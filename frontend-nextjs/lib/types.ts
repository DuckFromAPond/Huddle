// type set up for kanban board
export type KanbanCard = {
  id: string
  title: string
  desc?: string
  order: string        // fractional-indexing key, determines position within its column
}

export type KanbanColumn = {
  id: string
  title: string         // "Todo" | "In Progress" | "Done" for now 
  cards: KanbanCard[]
}

export type KanbanBoard = {
  columns: KanbanColumn[]
}

// type set up for project object 
export type Project = {
  id: string            
  name: string           // name of proj 
  desc?: string
  createdAt: number       // default on create 
  updatedAt: number       // last time content actually changed
  lastOpenedAt?: number    // last time user navigated in for "Recent"
  board?: KanbanBoard       // kanban data 
  schemaVersion: number    
}