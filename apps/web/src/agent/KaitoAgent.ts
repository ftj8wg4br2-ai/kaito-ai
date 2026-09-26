import { Task, AgentState } from "../types";
import { classifyIntent } from "./intent";
import { TaskManager } from "../core/TaskManager";

export class KaitoAgent {
  private taskManager = new TaskManager();

  constructor(initialTasks: Task[] = []) {
    this.taskManager.setTasks(initialTasks);
  }

  public handleTaskInput(input: string): { response: string; nextState: AgentState; tasks: Task[] } {
    const intent = classifyIntent(input);

    if (intent === "task") {
      const task: Task = {
        id: crypto.randomUUID(),
        title: "新しい作業",
        description: input,
        priority: 1,
        status: "queued",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        category: "general"
      };

      this.taskManager.addTask(task);

      return {
        response: "作業を受け取りました。計画を立てて、必要な確認を進めます。",
        nextState: "working",
        tasks: this.taskManager.getTasks()
      };
    }

    if (intent === "timer") {
      const task: Task = {
        id: crypto.randomUUID(),
        title: "タイマー",
        description: input,
        priority: 2,
        status: "queued",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        category: "timer"
      };

      this.taskManager.addTask(task);

      return {
        response: "タイマーを設定しました。",
        nextState: "working",
        tasks: this.taskManager.getTasks()
      };
    }

    if (intent === "chat") {
      return {
        response: "雑談モードです。作業に切り替えるなら、そのまま依頼してください。",
        nextState: "idle",
        tasks: this.taskManager.getTasks()
      };
    }

    if (intent === "security") {
      return {
        response: "安全確認を行います。重要な操作には本人確認を優先します。",
        nextState: "waiting_for_confirmation",
        tasks: this.taskManager.getTasks()
      };
    }

    return {
      response: "理解しました。まずは最小確認をしてから進めます。",
      nextState: "thinking",
      tasks: this.taskManager.getTasks()
    };
  }

  public getTasks(): Task[] {
    return this.taskManager.getTasks();
  }

  public setTasks(tasks: Task[]) {
    this.taskManager.setTasks(tasks);
  }
}
