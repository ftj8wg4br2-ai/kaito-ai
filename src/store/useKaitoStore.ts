import { create } from "zustand";
import { AgentState, LogEntry, MemoryEntry, Task } from "../types";
import { KaitoAgent } from "../agent/KaitoAgent";
import {
  loadAppState,
  loadLogs,
  loadMemories,
  loadTasks,
  saveAppState,
  saveBackupSnapshot,
  createBackupSnapshot,
  saveLogs,
  saveMemories,
  saveTasks,
  loadBackupSnapshot
} from "../lib/storage";
import { speakText, startSpeechRecognition } from "../lib/speech";

type KaitoStore = {
  agentState: AgentState;
  tasks: Task[];
  logs: LogEntry[];
  memories: MemoryEntry[];
  chatOpen: boolean;
  micOn: boolean;
  isListening: boolean;

  setAgentState: (state: AgentState) => void;
  setChatOpen: (open: boolean) => void;
  setMicOn: (on: boolean) => void;
  addLog: (entry: LogEntry) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  processInput: (input: string) => Promise<void>;
  startVoiceInput: () => void;
  stopVoiceInput: () => void;
  saveBackup: () => void;
  restoreBackup: () => void;
};

export const useKaitoStore = create<KaitoStore>((set, get) => {
  const initialTasks = loadTasks();
  const initialLogs = loadLogs();
  const initialMemories = loadMemories();

  const agent = new KaitoAgent(initialTasks);

  const persist = (nextTasks: Task[], nextLogs: LogEntry[], nextMemories: MemoryEntry[]) => {
    saveTasks(nextTasks);
    saveLogs(nextLogs);
    saveMemories(nextMemories);
    saveAppState(get().agentState);
  };

  return {
    agentState: (loadAppState() as AgentState) ?? "idle",
    tasks: initialTasks,
    logs: initialLogs,
    memories: initialMemories,
    chatOpen: false,
    micOn: false,
    isListening: false,

    setAgentState: (state) => {
      set({ agentState: state });
      saveAppState(state);
    },

    setChatOpen: (open) => set({ chatOpen: open }),
    setMicOn: (on) => set({ micOn: on }),

    addLog: (entry) => {
      const nextLogs = [entry, ...get().logs].slice(0, 100);
      set({ logs: nextLogs });
      saveLogs(nextLogs);
    },

    addTask: (task) => {
      const nextTasks = [task, ...get().tasks];
      set({ tasks: nextTasks });
      persist(nextTasks, get().logs, get().memories);
    },

    updateTask: (taskId, patch) => {
      const nextTasks = get().tasks.map((task) =>
        task.id === taskId ? { ...task, ...patch, updatedAt: Date.now() } : task
      );
      set({ tasks: nextTasks });
      persist(nextTasks, get().logs, get().memories);
    },

    processInput: async (input) => {
      const trimmed = input.trim();
      if (!trimmed) return;

      const nextLogs = [
        { id: crypto.randomUUID(), message: trimmed, role: "user", timestamp: Date.now() },
        ...get().logs
      ].slice(0, 100);

      set({ logs: nextLogs, micOn: false });
      saveLogs(nextLogs);

      const currentTasks = get().tasks;
      agent.setTasks(currentTasks);

      const result = agent.handleTaskInput(trimmed);

      const assistantLog: LogEntry = {
        id: crypto.randomUUID(),
        message: result.response,
        role: "assistant",
        timestamp: Date.now()
      };

      const updatedTasks = result.tasks;
      const nextEntries = [assistantLog, ...nextLogs].slice(0, 100);

      set({
        tasks: updatedTasks,
        logs: nextEntries,
        agentState: result.nextState
      });

      saveTasks(updatedTasks);
      saveLogs(nextEntries);
      saveAppState(result.nextState);

      speakText(result.response);

      if (result.nextState === "waiting_for_confirmation") {
        set({ chatOpen: true });
      }
    },

    startVoiceInput: () => {
      const speech = startSpeechRecognition({
        onResult: async (text) => {
          get().processInput(text);
        },
        onError: (error) => {
          console.error(error);
          set({ isListening: false, micOn: false });
        }
      });

      if (speech) {
        set({ micOn: true, isListening: true, agentState: "listening" });
      }
    },

    stopVoiceInput: () => {
      set({ micOn: false, isListening: false });
    },

    saveBackup: () => {
      const snapshot = createBackupSnapshot(
        get().tasks,
        get().logs,
        get().memories,
        get().agentState
      );

      saveBackupSnapshot(snapshot);
      set({ agentState: "completed" });
    },

    restoreBackup: () => {
      const snapshot = loadBackupSnapshot();
      if (!snapshot) return;

      set({
        tasks: snapshot.tasks,
        logs: snapshot.logs,
        memories: snapshot.memories,
        agentState: "idle"
      });

      saveTasks(snapshot.tasks);
      saveLogs(snapshot.logs);
      saveMemories(snapshot.memories);
    }
  };
});
