import type { AppConfig, TaskType, TodayReminder, WeekType } from "../types";
import { isLastWorkdayOfWeek, isWorkday } from "./workdayUtils";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getWeekType(config: AppConfig, date: Date): WeekType {
  if (config.manualWeekType && config.manualWeekType !== "auto") {
    return config.manualWeekType;
  }

  const cycleLength = Math.max(1, config.cycleLengthWeeks);
  const start = startOfLocalDay(parseLocalDate(config.demandWeekStartDate));
  const target = startOfLocalDay(date);
  const elapsedWeeks = Math.floor((target.getTime() - start.getTime()) / WEEK_MS);
  const cycleWeek = ((elapsedWeeks % cycleLength) + cycleLength) % cycleLength;
  return cycleWeek === 0 ? "demand_week" : "non_demand_week";
}

export function getTodayTask(config: AppConfig, date: Date): TaskType[] {
  if (!isWorkday(date, config.holidays, config.workdays)) return [];

  const tasks: TaskType[] = [];
  const day = date.getDay();
  const weekType = getWeekType(config, date);

  if (weekType === "demand_week" && day >= 1 && day <= 3) {
    tasks.push("write_prd", "align_dev");
  }

  if (weekType === "non_demand_week" && day >= 1 && day <= 3) {
    tasks.push("push_dev");
  }

  if (weekType === "non_demand_week" && (day === 4 || day === 5)) {
    tasks.push("acceptance");
  }

  if (isLastWorkdayOfWeek(date, config.holidays, config.workdays)) {
    tasks.push("weekly_report");
  }

  return tasks;
}

export function getTodayReminder(config: AppConfig, date = new Date()): TodayReminder {
  const holiday = config.holidays.includes(
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
  );

  return {
    weekType: getWeekType(config, date),
    tasks: getTodayTask(config, date),
    isWorkday: isWorkday(date, config.holidays, config.workdays),
    isHoliday: holiday,
  };
}
