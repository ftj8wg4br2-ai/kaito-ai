import { IntentType } from "../types";

export function classifyIntent(input: string): IntentType {
  const text = input.toLowerCase();

  if (/(雑談|話そう|話したい|おしゃべり|hello|hi)/.test(text)) return "chat";
  if (/(タイマー|アラーム|リマインダー|timer|alarm)/.test(text)) return "timer";
  if (/(予定|カレンダー|schedule|calendar)/.test(text)) return "calendar";
  if (/(検索|調べて|探して|find|search|look up)/.test(text)) return "search";
  if (/(ファイル|整理|pdf|doc|excel|画像|動画|写真)/.test(text)) return "file";
  if (/(写真生成|画像生成|動画生成|media)/.test(text)) return "media";
  if (/(確認|権限|security|privacy|保護|バックアップ)/.test(text)) return "security";
  if (/(やって|作って|しろ|実行|始めて|整理して|進めて)/.test(text)) return "task";

  return "unknown";
}
