import { BackupSnapshot, LogEntry, MemoryEntry, Task } from "../types";

const STORAGE_KEYS = {
  tasks: "kaito.tasks",
  logs: "kaito.logs",
  memories: "kaito.memories",
  backup: "kaito.backup",
  state: "kaito.state"
};

export function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function safeWrite<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local-only mode continues even when storage is unavailable.
  }
}

export const loadTasks = (): Task[] => safeRead<Task[]>(STORAGE_KEYS.tasks, []);
export const saveTasks = (tasks: Task[]): void => safeWrite(STORAGE_KEYS.tasks, tasks);
export const loadLogs = (): LogEntry[] => safeRead<LogEntry[]>(STORAGE_KEYS.logs, []);
export const saveLogs = (logs: LogEntry[]): void => safeWrite(STORAGE_KEYS.logs, logs);
export const loadMemories = (): MemoryEntry[] => safeRead<MemoryEntry[]>(STORAGE_KEYS.memories, []);
export const saveMemories = (memories: MemoryEntry[]): void => safeWrite(STORAGE_KEYS.memories, memories);

export function createBackupSnapshot(
  tasks: Task[],
  logs: LogEntry[],
  memories: MemoryEntry[],
  state: string
): BackupSnapshot {
  return { version: 1, savedAt: Date.now(), tasks, logs, memories, state };
}

export const saveBackupSnapshot = (snapshot: BackupSnapshot): void =>
  safeWrite(STORAGE_KEYS.backup, snapshot);

export const loadBackupSnapshot = (): BackupSnapshot | null =>
  safeRead<BackupSnapshot | null>(STORAGE_KEYS.backup, null);

export const saveAppState = (state: string): void => safeWrite(STORAGE_KEYS.state, state);
export const loadAppState = (): string => safeRead<string>(STORAGE_KEYS.state, "idle");
