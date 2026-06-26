import { isTauri } from "@tauri-apps/api/core";
import { emitTo, listen } from "@tauri-apps/api/event";
import { LogicalPosition, LogicalSize } from "@tauri-apps/api/window";
import { currentMonitor, cursorPosition, getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useMemo, useState } from "react";
import exercisePet from "../assets/pet/exercise.png";
import happyPet from "../assets/pet/happy.png";
import workingPet from "../assets/pet/working.png";
import { getHealthStatus, normalizeHealthState, recordHealthAction, snoozeHealthReminder, type HealthAction } from "../domain/healthEngine";
import { getTodayReminder } from "../domain/reminderEngine";
import { taskCopy } from "../domain/reminderCopy";
import { loadAppData, saveAppData } from "../storage/storage";

interface RoamingPayload {
  enabled: boolean;
}

const PET_WINDOW_WIDTH = 90;
const PET_WINDOW_HEIGHT = 110;
const PET_BUBBLE_WINDOW_WIDTH = 278;
const PET_BUBBLE_WINDOW_HEIGHT = 184;
const PET_POSITION_KEY = "pushpet.pet-position.v1";

function pickRandom(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function savePetPosition(x: number, y: number): void {
  window.localStorage.setItem(PET_POSITION_KEY, JSON.stringify({ x: Math.round(x), y: Math.round(y) }));
}

function loadPetPosition(): { x: number; y: number } | null {
  try {
    const raw = window.localStorage.getItem(PET_POSITION_KEY);
    return raw ? JSON.parse(raw) as { x: number; y: number } : null;
  } catch {
    return null;
  }
}

function getSelectedPetAssets(data: ReturnType<typeof loadAppData>) {
  return data.desktopPets.find((pet) => pet.id === data.config.selectedDesktopPetId)?.assets
    ?? data.desktopPets[0]?.assets
    ?? {};
}

export function PetWindow() {
  const [data, setData] = useState(() => loadAppData());
  const now = useMemo(() => new Date(), []);
  const reminder = useMemo(() => getTodayReminder(data.config, now), [data.config, now]);
  const health = useMemo(() => normalizeHealthState(data.health, now), [data.health, now]);
  const healthStatus = useMemo(() => getHealthStatus(data.config, health, now), [data.config, health, now]);
  const selectedAssets = useMemo(() => getSelectedPetAssets(data), [data]);
  const [roamingEnabled, setRoamingEnabled] = useState(data.config.desktopPetRoamingEnabled);
  const [isWalking, setIsWalking] = useState(false);
  const [isManualDragging, setIsManualDragging] = useState(false);
  const showHealthBubble = healthStatus.isDue;

  useEffect(() => {
    if (!isTauri() || data.config.desktopPetModeEnabled) return;
    void getCurrentWindow().hide();
  }, [data.config.desktopPetModeEnabled]);

  useEffect(() => {
    if (!isTauri()) return;

    const placePet = async () => {
      const windowRef = getCurrentWindow();
      await windowRef.setSize(new LogicalSize(PET_WINDOW_WIDTH, PET_WINDOW_HEIGHT));
      const saved = loadPetPosition();
      if (saved) {
        await windowRef.setPosition(new LogicalPosition(saved.x, saved.y));
        if (data.config.desktopPetModeEnabled) {
          await windowRef.setAlwaysOnTop(true);
          await windowRef.show();
        }
        return;
      }

      const monitor = await currentMonitor();
      if (!monitor) return;

      const workPosition = monitor.workArea.position.toLogical(monitor.scaleFactor);
      const workSize = monitor.workArea.size.toLogical(monitor.scaleFactor);
      const x = workPosition.x + workSize.width - PET_WINDOW_WIDTH - 18;
      const y = workPosition.y + workSize.height - PET_WINDOW_HEIGHT - 18;
      await windowRef.setPosition(new LogicalPosition(Math.round(x), Math.round(y)));
      savePetPosition(x, y);
      if (data.config.desktopPetModeEnabled) {
        await windowRef.setAlwaysOnTop(true);
        await windowRef.show();
      }
    };

    void placePet();
  }, [data.config.desktopPetModeEnabled]);

  const taskMessage = reminder.tasks.length
    ? taskCopy[reminder.tasks[0]]
    : reminder.isWorkday
      ? "今天没有固定流程任务，我在桌面上陪你巡逻。"
      : "今天不是工作日，小兽软乎乎待机。";
  const message = showHealthBubble ? healthStatus.message : taskMessage;
  const currentFrame = isManualDragging
    ? selectedAssets.dragging ?? happyPet
    : isWalking
      ? selectedAssets.walking ?? exercisePet
      : selectedAssets.working ?? workingPet;

  useEffect(() => {
    if (!isTauri()) return;

    const windowRef = getCurrentWindow();
    const width = showHealthBubble ? PET_BUBBLE_WINDOW_WIDTH : PET_WINDOW_WIDTH;
    const height = showHealthBubble ? PET_BUBBLE_WINDOW_HEIGHT : PET_WINDOW_HEIGHT;
    const resizeAndClamp = async () => {
      await windowRef.setSize(new LogicalSize(width, height));

      const monitor = await currentMonitor();
      if (!monitor) return;

      const workPosition = monitor.workArea.position.toLogical(monitor.scaleFactor);
      const workSize = monitor.workArea.size.toLogical(monitor.scaleFactor);
      const currentPosition = (await windowRef.outerPosition()).toLogical(await windowRef.scaleFactor());
      const x = Math.min(
        Math.max(currentPosition.x, workPosition.x + 8),
        workPosition.x + workSize.width - width - 8,
      );
      const y = Math.min(
        Math.max(currentPosition.y, workPosition.y + 8),
        workPosition.y + workSize.height - height - 8,
      );

      await windowRef.setPosition(new LogicalPosition(Math.round(x), Math.round(y)));
      savePetPosition(x, y);
    };

    void resizeAndClamp();
  }, [showHealthBubble]);

  useEffect(() => {
    if (!isTauri()) return undefined;

    let unlisten: (() => void) | undefined;
    listen<RoamingPayload>("pushpet://pet-roaming", (event) => {
      setRoamingEnabled(event.payload.enabled);
    }).then((dispose) => {
      unlisten = dispose;
    });

    return () => unlisten?.();
  }, []);

  useEffect(() => {
    if (!isTauri()) return undefined;

    let unlisten: (() => void) | undefined;
    listen("pushpet://pet-design-updated", () => {
      setData(loadAppData());
    }).then((dispose) => {
      unlisten = dispose;
    });

    return () => unlisten?.();
  }, []);

  useEffect(() => {
    if (!isTauri()) return undefined;

    let unlisten: (() => void) | undefined;
    listen("pushpet://health-updated", () => {
      setData(loadAppData());
    }).then((dispose) => {
      unlisten = dispose;
    });

    return () => unlisten?.();
  }, []);

  useEffect(() => {
    if (!isTauri() || !roamingEnabled) return undefined;

    let cancelled = false;
    let moving = false;
    const windowRef = getCurrentWindow();

    const moveOnce = async () => {
      if (moving || cancelled) return;
      moving = true;
      setIsWalking(true);

      try {
        const monitor = await currentMonitor();
        if (!monitor) return;

      const workPosition = monitor.workArea.position.toLogical(monitor.scaleFactor);
      const workSize = monitor.workArea.size.toLogical(monitor.scaleFactor);
      const currentPosition = await windowRef.outerPosition();
      const logicalCurrent = currentPosition.toLogical(await windowRef.scaleFactor());
      const width = showHealthBubble ? PET_BUBBLE_WINDOW_WIDTH : PET_WINDOW_WIDTH;
      const height = showHealthBubble ? PET_BUBBLE_WINDOW_HEIGHT : PET_WINDOW_HEIGHT;
      const maxX = workPosition.x + workSize.width - width - 10;
      const maxY = workPosition.y + workSize.height - height - 10;
        const target = {
          x: pickRandom(workPosition.x + 12, Math.max(workPosition.x + 12, maxX)),
          y: pickRandom(workPosition.y + 24, Math.max(workPosition.y + 24, maxY)),
        };
        const steps = 96;

        for (let i = 1; i <= steps && !cancelled; i += 1) {
          const eased = 1 - Math.pow(1 - i / steps, 3);
          const x = logicalCurrent.x + (target.x - logicalCurrent.x) * eased;
          const y = logicalCurrent.y + (target.y - logicalCurrent.y) * eased;
          await windowRef.setPosition(new LogicalPosition(Math.round(x), Math.round(y)));
          await delay(42);
        }
        savePetPosition(target.x, target.y);
      } finally {
        moving = false;
        setIsWalking(false);
      }
    };

    const startTimer = window.setTimeout(moveOnce, 15000);
    const interval = window.setInterval(moveOnce, 45000);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.clearInterval(interval);
    };
  }, [roamingEnabled, showHealthBubble]);

  const hidePet = async () => {
    if (!isTauri()) return;
    const next = loadAppData();
    saveAppData({
      ...next,
      config: { ...next.config, desktopPetModeEnabled: false },
    });
    await emitTo("main", "pushpet://pet-visibility", { visible: false });
    await getCurrentWindow().hide();
  };

  const syncHealthData = async (action: HealthAction | "snooze") => {
    const current = loadAppData();
    const next = {
      ...current,
      health: action === "snooze"
        ? snoozeHealthReminder(current.health, 15)
        : recordHealthAction(current.health, action),
    };
    saveAppData(next);
    setData(next);
    if (isTauri()) {
      await emitTo("main", "pushpet://app-data-updated", {});
    }
  };

  const startDrag = async (event: React.MouseEvent) => {
    if (!isTauri() || event.button !== 0) return;
    event.preventDefault();
    setIsManualDragging(true);
    setIsWalking(false);

    const windowRef = getCurrentWindow();
    try {
      await windowRef.startDragging();
      const latest = (await windowRef.outerPosition()).toLogical(await windowRef.scaleFactor());
      savePetPosition(latest.x, latest.y);
      return;
    } catch {
      // Fallback for transparent-window edge cases where native dragging is unavailable.
    } finally {
      window.setTimeout(() => setIsManualDragging(false), 1200);
    }

    try {
      setIsManualDragging(true);
      const scaleFactor = await windowRef.scaleFactor();
      const windowPosition = (await windowRef.outerPosition()).toLogical(scaleFactor);
      const pointerPosition = (await cursorPosition()).toLogical(scaleFactor);
      const offset = {
        x: pointerPosition.x - windowPosition.x,
        y: pointerPosition.y - windowPosition.y,
      };

      for (let i = 0; i < 240 && event.buttons === 1; i += 1) {
        const pointer = (await cursorPosition()).toLogical(scaleFactor);
        await windowRef.setPosition(new LogicalPosition(
          Math.round(pointer.x - offset.x),
          Math.round(pointer.y - offset.y),
        ));
        await delay(16);
      }

      const latest = (await windowRef.outerPosition()).toLogical(await windowRef.scaleFactor());
      savePetPosition(latest.x, latest.y);
    } finally {
      setIsManualDragging(false);
    }
  };

  return (
    <main
      className={`pet-window-shell ${healthStatus.mood} ${showHealthBubble ? "health-due" : ""} ${isWalking ? "walking" : ""}`}
      onContextMenu={(event) => {
        event.preventDefault();
        void hidePet();
      }}
      onMouseDown={(event) => void startDrag(event)}
      onMouseUp={() => setIsManualDragging(false)}
      onMouseLeave={() => setIsManualDragging(false)}
      title="左键拖动，右键隐藏"
    >
      {showHealthBubble ? (
        <div className="pet-window-bubble">
          <p>{message}</p>
          <div className="pet-window-actions">
            <button
              type="button"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => void syncHealthData("drink_water")}
            >
              喝水了
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => void syncHealthData("stand_up")}
            >
              站起来了
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => void syncHealthData("snooze")}
            >
              稍后
            </button>
          </div>
        </div>
      ) : null}
      <img className="pet-window-sprite" src={currentFrame} alt="桌面需求小兽" draggable={false} />
    </main>
  );
}
