export type PermissionLevel = "none" | "read" | "write" | "delete" | "admin";

export type SecurityContext = {
  userConfirmed: boolean;
  permission: PermissionLevel;
  criticalOperation: boolean;
};

export function canExecute(context: SecurityContext): boolean {
  if (context.criticalOperation && !context.userConfirmed) return false;
  if (context.permission === "none") return false;
  return true;
}
