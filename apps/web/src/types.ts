export type AgentState =
  | "idle"
  | "listening"
  | "thinking"
  | "searching"
  | "working"
  | "speaking"
  | "waiting_for_confirmation"
  | "completed"
  | "error";

export type TaskStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "waiting_for_input";

export type IntentType =
  | "chat"
  | "task"
  | "timer"
  | "calendar"
  | "search"
  | "file"
  | "media"
  | "security"
  | "unknown";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: number;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  dueAt?: number;
  category?: string;
  userId?: string;
}

export interface LogEntry {
  id: string;
  message: string;
  role: "assistant" | "user" | "system";
  timestamp: number;
  userId?: string;
}

export interface MemoryEntry {
  id: string;
  key: string;
  value: string;
  createdAt: number;
  userId?: string;
}

export interface BackupSnapshot {
  version: number;
  savedAt: number;
  tasks: Task[];
  logs: LogEntry[];
  memories: MemoryEntry[];
  state: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: number;
}
