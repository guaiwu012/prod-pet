import { DEFAULT_DESKTOP_PET_ID, defaultData } from "./defaultData";
import type { AppData } from "../types";

const STORAGE_KEY = "pushpet.app-data.v1";

function cloneDefaults(): AppData {
  return JSON.parse(JSON.stringify(defaultData)) as AppData;
}

export function loadAppData(): AppData {
  if (typeof window === "undefined") return cloneDefaults();

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return cloneDefaults();

    const parsed = JSON.parse(saved) as Partial<AppData>;
    const desktopPets = parsed.desktopPets?.length ? parsed.desktopPets : defaultData.desktopPets;
    const savedDesktopPetId = parsed.config?.selectedDesktopPetId;
    const selectedDesktopPetId = savedDesktopPetId && desktopPets.some((pet) => pet.id === savedDesktopPetId)
      ? savedDesktopPetId
      : desktopPets[0]?.id ?? DEFAULT_DESKTOP_PET_ID;

    return {
      ...cloneDefaults(),
      ...parsed,
      config: { ...defaultData.config, ...parsed.config, selectedDesktopPetId },
      desktopPets,
      colleagues: parsed.colleagues ?? [],
      communicationLogs: parsed.communicationLogs ?? [],
      completedDates: parsed.completedDates ?? [],
      health: { ...defaultData.health, ...parsed.health },
    };
  } catch {
    return cloneDefaults();
  }
}

export function saveAppData(data: AppData): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateAppData(updater: (current: AppData) => AppData): AppData {
  const next = updater(loadAppData());
  saveAppData(next);
  return next;
}

export function resetAppData(): AppData {
  const next = cloneDefaults();
  saveAppData(next);
  return next;
}
