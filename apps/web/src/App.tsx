import { useState } from "react";
import { useKaitoStore } from "./store/useKaitoStore";

const stateText: Record<string, string> = {
  idle: "待機中",
  listening: "聞いています",
  thinking: "考えています",
  searching: "検索中",
  working: "作業しています",
  speaking: "話しています",
  waiting_for_confirmation: "確認が必要です",
  completed: "完了しました",
  error: "エラー"
};

export default function App() {
  const {
    agentState,
    tasks,
    logs,
    chatOpen,
    micOn,
    startVoiceInput,
    stopVoiceInput,
    processInput,
    saveBackup,
    restoreBackup,
    setChatOpen
  } = useKaitoStore();

  const [input, setInput] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    await processInput(input);
    setInput("");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="status-pill">{stateText[agentState] ?? "待機中"}</div>
        <div className="mic-indicator">{micOn ? "マイクON" : "マイクOFF"}</div>
      </header>

      <main className="main-panel">
        <div className="moya-wrap">
          <div className={`moya ${agentState}`} aria-label="Kaito visual state" />
        </div>

        <div className="controls">
          <button onClick={startVoiceInput} className="primary">音声入力</button>
          <button onClick={stopVoiceInput} className="secondary">停止</button>
          <button onClick={() => setChatOpen(!chatOpen)} className="secondary">
            {chatOpen ? "音声に戻す" : "チャット出す"}
          </button>
          <button onClick={saveBackup} className="secondary">バックアップ</button>
          <button onClick={restoreBackup} className="secondary">復元</button>
        </div>

        {chatOpen && (
          <div className="chat-panel">
            <form onSubmit={handleSubmit} className="composer">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Kaito、○○して"
                aria-label="Kaitoへの入力"
              />
              <button type="submit">送信</button>
            </form>
            <div className="log-list">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className={`log ${log.role}`}>{log.message}</div>
              ))}
            </div>
          </div>
        )}

        <div className="task-list">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="task-item">
              <span>{task.title}</span>
              <small>{task.status}</small>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
