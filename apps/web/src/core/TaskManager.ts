import { Task, TaskStatus } from "../types";

export class TaskManager {
  private tasks: Task[] = [];

  setTasks(tasks: Task[]) {
    this.tasks = tasks;
  }

  addTask(task: Task) {
    this.tasks.push(task);
  }

  updateTask(taskId: string, patch: Partial<Task>) {
    const index = this.tasks.findIndex((task) => task.id === taskId);
    if (index === -1) return;

    this.tasks[index] = {
      ...this.tasks[index],
      ...patch,
      updatedAt: Date.now()
    };
  }

  pauseTask(taskId: string) {
    this.updateTask(taskId, { status: "paused" });
  }

  resumeTask(taskId: string) {
    this.updateTask(taskId, { status: "queued" });
  }

  completeTask(taskId: string) {
    this.updateTask(taskId, { status: "completed" });
  }

  getTasks(): Task[] {
    return [...this.tasks].sort((a, b) => b.priority - a.priority);
  }

  getCountByStatus(status: TaskStatus): number {
    return this.tasks.filter((task) => task.status === status).length;
  }
}
