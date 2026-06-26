export type AppRoute =
  | "dashboard"
  | "cycle"
  | "colleagues"
  | "logs"
  | "weekly"
  | "petDesign"
  | "ai"
  | "health";

export interface NavItem {
  id: AppRoute;
  label: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { id: "dashboard", label: "今日任务", icon: "☀" },
  { id: "cycle", label: "周期配置", icon: "↻" },
  { id: "colleagues", label: "同事管理", icon: "♟" },
  { id: "logs", label: "沟通记录", icon: "✎" },
  { id: "weekly", label: "周报生成", icon: "▤" },
  { id: "petDesign", label: "桌宠设计", icon: "◒" },
  { id: "ai", label: "AI 设置", icon: "✦" },
  { id: "health", label: "健康提醒", icon: "♡" },
];
