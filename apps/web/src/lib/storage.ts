import { BackupSnapshot, LogEntry, MemoryEntry, Task } from "../types";
import { getAuthToken } from "./auth";

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

export function safeWrite<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ローカルストレージ
export function loadTasks(): Task[] {
  return safeRead<Task[]>(STORAGE_KEYS.tasks, []);
}

export function saveTasks(tasks: Task[]) {
  safeWrite(STORAGE_KEYS.tasks, tasks);
  syncToServer("tasks", tasks);
}

export function loadLogs(): LogEntry[] {
  return safeRead<LogEntry[]>(STORAGE_KEYS.logs, []);
}

export function saveLogs(logs: LogEntry[]) {
  safeWrite(STORAGE_KEYS.logs, logs);
  syncToServer("logs", logs);
}

export function loadMemories(): MemoryEntry[] {
  return safeRead<MemoryEntry[]>(STORAGE_KEYS.memories, []);
}

export function saveMemories(memories: MemoryEntry[]) {
  safeWrite(STORAGE_KEYS.memories, memories);
  syncToServer("memories", memories);
}

// バックアップ
export function createBackupSnapshot(
  tasks: Task[],
  logs: LogEntry[],
  memories: MemoryEntry[],
  state: string
): BackupSnapshot {
  return {
    version: 1,
    savedAt: Date.now(),
    tasks,
    logs,
    memories,
    state
  };
}

export function saveBackupSnapshot(snapshot: BackupSnapshot) {
  safeWrite(STORAGE_KEYS.backup, snapshot);
  syncToServer("backup", snapshot);
}

export function loadBackupSnapshot(): BackupSnapshot | null {
  return safeRead<BackupSnapshot | null>(STORAGE_KEYS.backup, null);
}

export function saveAppState(state: string) {
  safeWrite(STORAGE_KEYS.state, state);
}

export function loadAppState(): string {
  return safeRead<string>(STORAGE_KEYS.state, "idle");
}

// クラウド同期
async function syncToServer(dataType: string, data: any) {
  const token = getAuthToken();
  if (!token) return;

  try {
    await fetch("/api/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ dataType, data, timestamp: Date.now() })
    });
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

// クラウドからの復元
export async function restoreFromServer(): Promise<{
  tasks: Task[];
  logs: LogEntry[];
  memories: MemoryEntry[];
} | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch("/api/sync", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.json();
  } catch (error) {
    console.error("Restore failed:", error);
    return null;
  }
}
