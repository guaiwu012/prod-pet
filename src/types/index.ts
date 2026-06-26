export type WeekType = "demand_week" | "non_demand_week";

export type TaskType =
  | "write_prd"
  | "align_dev"
  | "push_dev"
  | "acceptance"
  | "weekly_report"
  | "drink_water"
  | "stand_up";

export type ColleagueRole = "frontend" | "backend" | "data" | "qa" | "other";

export type CommunicationStatus =
  | "draft"
  | "aligning"
  | "developing"
  | "testing"
  | "accepted"
  | "launched"
  | "blocked";

export interface Colleague {
  id: string;
  name: string;
  role: ColleagueRole;
  modules: string[];
  communicationTags: string[];
  manualProfile?: string;
  useAiProfile: boolean;
  aiProfile?: string;
  notes?: string;
}

export interface CommunicationLog {
  id: string;
  demandName: string;
  colleagueId: string;
  colleagueName: string;
  time: string;
  summary: string;
  status: CommunicationStatus;
  hasBlocker: boolean;
  blocker?: string;
  nextAction?: string;
}

export interface AppConfig {
  demandWeekStartDate: string;
  cycleLengthWeeks: number;
  manualWeekType?: WeekType | "auto";
  workdays: number[];
  holidays: string[];
  workStartTime: string;
  workEndTime: string;
  reminderTime: string;
  weeklyReportReminderTime: string;
  healthReminderEnabled: boolean;
  healthReminderIntervalMinutes: number;
  naughtyModeEnabled: boolean;
  desktopPetModeEnabled: boolean;
  desktopPetRoamingEnabled: boolean;
  selectedDesktopPetId: string;
  aiEnabled: boolean;
  deepseekApiKey?: string;
  deepseekBaseUrl: string;
  deepseekModel?: string;
}

export type DesktopPetAssetState = "working" | "walking" | "dragging" | "sleeping";

export interface DesktopPetAssets {
  working?: string;
  walking?: string;
  dragging?: string;
  sleeping?: string;
}

export interface DesktopPetDesign {
  id: string;
  name: string;
  description?: string;
  assets: DesktopPetAssets;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  config: AppConfig;
  desktopPets: DesktopPetDesign[];
  colleagues: Colleague[];
  communicationLogs: CommunicationLog[];
  completedDates: string[];
  health: HealthState;
}

export interface TodayReminder {
  weekType: WeekType;
  tasks: TaskType[];
  isWorkday: boolean;
  isHoliday: boolean;
}

export interface HealthState {
  dateKey: string;
  waterCount: number;
  standCount: number;
  lastReminderAt?: string;
  snoozedUntil?: string;
}
