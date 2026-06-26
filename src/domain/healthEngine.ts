import type { AppConfig, HealthState } from "../types";

export type HealthAction = "drink_water" | "stand_up";

export interface HealthStatus {
  isEnabled: boolean;
  isDue: boolean;
  isSnoozed: boolean;
  minutesUntilNext: number;
  overdueMinutes: number;
  message: string;
  mood: "calm" | "happy" | "naughty";
}

export function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function normalizeHealthState(health: HealthState, now = new Date()): HealthState {
  const dateKey = toLocalDateKey(now);
  if (health.dateKey === dateKey) return health;

  return {
    dateKey,
    waterCount: 0,
    standCount: 0,
    lastReminderAt: undefined,
    snoozedUntil: undefined,
  };
}

export function getHealthStatus(config: AppConfig, health: HealthState, now = new Date()): HealthStatus {
  const normalized = normalizeHealthState(health, now);
  const intervalMs = Math.max(config.healthReminderIntervalMinutes, 5) * 60 * 1000;
  const snoozedUntil = normalized.snoozedUntil ? new Date(normalized.snoozedUntil).getTime() : 0;
  const isSnoozed = snoozedUntil > now.getTime();

  if (!config.healthReminderEnabled) {
    return {
      isEnabled: false,
      isDue: false,
      isSnoozed: false,
      minutesUntilNext: 0,
      overdueMinutes: 0,
      message: "健康提醒已关闭。小兽暂时不唠叨，但你的肩颈可能会记账。",
      mood: "calm",
    };
  }

  if (isSnoozed) {
    const minutesUntilNext = Math.ceil((snoozedUntil - now.getTime()) / 60000);
    return {
      isEnabled: true,
      isDue: false,
      isSnoozed: true,
      minutesUntilNext,
      overdueMinutes: 0,
      message: `已稍后提醒，约 ${minutesUntilNext} 分钟后小兽再来扒拉你。`,
      mood: "calm",
    };
  }

  const lastReminderTime = normalized.lastReminderAt ? new Date(normalized.lastReminderAt).getTime() : 0;
  const elapsed = lastReminderTime ? now.getTime() - lastReminderTime : intervalMs;
  const isDue = elapsed >= intervalMs;
  const minutesUntilNext = isDue ? 0 : Math.ceil((intervalMs - elapsed) / 60000);
  const overdueMinutes = isDue ? Math.floor((elapsed - intervalMs) / 60000) : 0;
  const hasMovedToday = normalized.waterCount > 0 && normalized.standCount > 0;
  const naughty = config.naughtyModeEnabled && isDue && (overdueMinutes >= config.healthReminderIntervalMinutes || !hasMovedToday);

  return {
    isEnabled: true,
    isDue,
    isSnoozed: false,
    minutesUntilNext,
    overdueMinutes,
    mood: naughty ? "naughty" : isDue ? "happy" : "calm",
    message: isDue
      ? naughty
        ? "你已经坐太久啦。小兽要开始在屏幕边缘假装路过：喝口水，站起来，给身体一个版本更新。"
        : "到点啦：喝口水，站起来活动 1 分钟。需求可以排期，身体不能延期。"
      : `健康提醒运行中，约 ${minutesUntilNext} 分钟后提醒。今天已喝水 ${normalized.waterCount} 次，站立 ${normalized.standCount} 次。`,
  };
}

export function recordHealthAction(health: HealthState, action: HealthAction, now = new Date()): HealthState {
  const normalized = normalizeHealthState(health, now);
  return {
    ...normalized,
    waterCount: action === "drink_water" ? normalized.waterCount + 1 : normalized.waterCount,
    standCount: action === "stand_up" ? normalized.standCount + 1 : normalized.standCount,
    lastReminderAt: now.toISOString(),
    snoozedUntil: undefined,
  };
}

export function snoozeHealthReminder(health: HealthState, minutes = 15, now = new Date()): HealthState {
  const normalized = normalizeHealthState(health, now);
  const until = new Date(now.getTime() + minutes * 60 * 1000);
  return {
    ...normalized,
    snoozedUntil: until.toISOString(),
  };
}
