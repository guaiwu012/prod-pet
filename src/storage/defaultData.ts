import type { AppData } from "../types";
import exercisePet from "../assets/pet/exercise.png";
import happyPet from "../assets/pet/happy.png";
import sleepPet from "../assets/pet/sleep.png";
import workingPet from "../assets/pet/working.png";

export const DEFAULT_DESKTOP_PET_ID = "default-xiaoye";

function getMonday(date: Date): Date {
  const monday = new Date(date);
  const day = monday.getDay() || 7;
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - day + 1);
  return monday;
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const defaultData: AppData = {
  config: {
    demandWeekStartDate: toLocalDateString(getMonday(new Date())),
    cycleLengthWeeks: 2,
    manualWeekType: "auto",
    workdays: [1, 2, 3, 4, 5],
    holidays: [],
    workStartTime: "09:30",
    workEndTime: "18:30",
    reminderTime: "10:00",
    weeklyReportReminderTime: "16:30",
    healthReminderEnabled: true,
    healthReminderIntervalMinutes: 60,
    naughtyModeEnabled: false,
    desktopPetModeEnabled: true,
    desktopPetRoamingEnabled: true,
    selectedDesktopPetId: DEFAULT_DESKTOP_PET_ID,
    aiEnabled: false,
    deepseekBaseUrl: "https://api.deepseek.com",
    deepseekModel: "",
  },
  desktopPets: [
    {
      id: DEFAULT_DESKTOP_PET_ID,
      name: "小夜",
      description: "默认桌宠素材，可复制后替换成自己的透明图。",
      assets: {
        working: workingPet,
        walking: exercisePet,
        dragging: happyPet,
        sleeping: sleepPet,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  colleagues: [],
  communicationLogs: [],
  completedDates: [],
  health: {
    dateKey: toLocalDateString(new Date()),
    waterCount: 0,
    standCount: 0,
  },
};
