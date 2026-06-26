import { isTauri } from "@tauri-apps/api/core";
import { emitTo } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function setDesktopPetMode(enabled: boolean): Promise<"tauri" | "web"> {
  if (!isTauri()) return "web";

  const window = getCurrentWindow();
  await window.setAlwaysOnTop(enabled);
  await window.setSkipTaskbar(enabled);
  return "tauri";
}

export function getDesktopRuntimeLabel(): "tauri" | "web" {
  return isTauri() ? "tauri" : "web";
}

async function getPetWindow(): Promise<WebviewWindow | null> {
  if (!isTauri()) return null;
  return WebviewWindow.getByLabel("pet");
}

export async function showPetWindow(): Promise<"tauri" | "web" | "missing"> {
  const petWindow = await getPetWindow();
  if (!isTauri()) return "web";
  if (!petWindow) return "missing";

  await petWindow.show();
  await petWindow.setAlwaysOnTop(true);
  return "tauri";
}

export async function hidePetWindow(): Promise<"tauri" | "web" | "missing"> {
  const petWindow = await getPetWindow();
  if (!isTauri()) return "web";
  if (!petWindow) return "missing";

  await petWindow.hide();
  return "tauri";
}

export async function setPetWindowVisible(visible: boolean): Promise<"tauri" | "web" | "missing"> {
  return visible ? showPetWindow() : hidePetWindow();
}

export async function setPetRoamingEnabled(enabled: boolean): Promise<"tauri" | "web"> {
  if (!isTauri()) return "web";
  await emitTo("pet", "pushpet://pet-roaming", { enabled });
  return "tauri";
}
