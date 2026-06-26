import { isTauri } from "@tauri-apps/api/core";
import { emitTo, listen } from "@tauri-apps/api/event";
import { useEffect, useMemo, useState } from "react";
import workingPet from "../assets/pet/working.png";
import { PageHeader } from "../components/PageHeader";
import { getHealthStatus, normalizeHealthState, recordHealthAction, snoozeHealthReminder } from "../domain/healthEngine";
import { getDesktopRuntimeLabel, setPetRoamingEnabled, setPetWindowVisible } from "../services/desktopWindow";
import type { AppConfig, AppData } from "../types";

interface HealthSettingsPageProps {
  data: AppData;
  updateData: (updater: (current: AppData) => AppData) => void;
}

interface PetVisibilityPayload {
  visible: boolean;
}

export function HealthSettingsPage({ data, updateData }: HealthSettingsPageProps) {
  const [draft, setDraft] = useState<AppConfig>(data.config);
  const [saved, setSaved] = useState(false);
  const [desktopHint, setDesktopHint] = useState("");
  const health = useMemo(() => normalizeHealthState(data.health), [data.health]);
  const status = useMemo(() => getHealthStatus(draft, health), [draft, health]);
  const selectedPet = data.desktopPets.find((pet) => pet.id === draft.selectedDesktopPetId) ?? data.desktopPets[0];

  const notifyPetHealthUpdated = () => {
    if (!isTauri()) return;
    window.setTimeout(() => {
      void emitTo("pet", "pushpet://health-updated", {});
    }, 0);
  };

  useEffect(() => {
    if (!isTauri()) return undefined;

    let unlisten: (() => void) | undefined;
    listen<PetVisibilityPayload>("pushpet://pet-visibility", (event) => {
      setDraft((current) => ({ ...current, desktopPetModeEnabled: event.payload.visible }));
    }).then((dispose) => {
      unlisten = dispose;
    });

    return () => unlisten?.();
  }, []);

  const patchDraft = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    updateData((current) => ({
      ...current,
      config: {
        ...current.config,
        healthReminderEnabled: draft.healthReminderEnabled,
        healthReminderIntervalMinutes: Math.max(5, Number(draft.healthReminderIntervalMinutes) || 60),
        naughtyModeEnabled: draft.naughtyModeEnabled,
        desktopPetModeEnabled: draft.desktopPetModeEnabled,
        desktopPetRoamingEnabled: draft.desktopPetRoamingEnabled,
      },
      health: normalizeHealthState(current.health),
    }));
    const runtime = await setPetWindowVisible(draft.desktopPetModeEnabled);
    await setPetRoamingEnabled(draft.desktopPetRoamingEnabled);
    setDesktopHint(runtime === "tauri"
      ? draft.desktopPetModeEnabled ? "浮窗已显示，右键小兽可隐藏。" : "浮窗已隐藏，可随时在这里打开。"
      : "当前是 Web 预览；Tauri 桌面端会实时显示/隐藏浮窗。");
    setSaved(true);
  };

  const togglePetVisible = async () => {
    const nextVisible = !draft.desktopPetModeEnabled;
    setDraft((current) => ({ ...current, desktopPetModeEnabled: nextVisible }));
    updateData((current) => ({
      ...current,
      config: { ...current.config, desktopPetModeEnabled: nextVisible },
    }));
    const runtime = await setPetWindowVisible(nextVisible);
    setDesktopHint(runtime === "tauri"
      ? nextVisible ? "浮窗已显示。" : "浮窗已隐藏。"
      : "Web 预览中已保存设置；桌面端会实时生效。");
    setSaved(false);
  };

  const togglePetRoaming = async () => {
    const nextRoaming = !draft.desktopPetRoamingEnabled;
    setDraft((current) => ({ ...current, desktopPetRoamingEnabled: nextRoaming }));
    updateData((current) => ({
      ...current,
      config: { ...current.config, desktopPetRoamingEnabled: nextRoaming },
    }));
    await setPetRoamingEnabled(nextRoaming);
    setDesktopHint(nextRoaming ? "小兽开始在屏幕上巡逻。" : "小兽已停止乱走，仍可手动拖动。");
    setSaved(false);
  };

  const record = (action: "drink_water" | "stand_up") => {
    updateData((current) => ({ ...current, health: recordHealthAction(current.health, action) }));
    notifyPetHealthUpdated();
  };

  const snooze = () => {
    updateData((current) => ({ ...current, health: snoozeHealthReminder(current.health, 15) }));
    notifyPetHealthUpdated();
  };

  const resetToday = () => {
    updateData((current) => ({
      ...current,
      health: {
        ...normalizeHealthState(current.health),
        waterCount: 0,
        standCount: 0,
        lastReminderAt: undefined,
        snoozedUntil: undefined,
      },
    }));
    notifyPetHealthUpdated();
  };

  return (
    <>
      <PageHeader
        eyebrow="小夜桌宠"
        title="小夜的桌面模式"
        description="先放最常用的显示、隐藏和巡逻；健康提醒这类低频设置收在下面。"
        action={<button className="button primary" onClick={save}>{saved ? "已保存" : "保存健康设置"}</button>}
      />

      <section className="health-dashboard">
        <article className={`panel health-control-card ${status.mood}`}>
          <div className="health-pet-preview" aria-hidden="true">
            <img src={selectedPet?.assets.working ?? workingPet} alt="" />
          </div>
          <div className="health-control-copy">
            <p className="eyebrow">桌宠浮窗</p>
            <h2>{draft.desktopPetModeEnabled ? "小夜正在桌面陪你。" : "小夜已隐藏。"}</h2>
            <p className="empty-state">默认在屏幕右下角；左键拖动，右键隐藏，位置会自动记住。</p>
            <div className="health-stats">
              <span>{draft.desktopPetModeEnabled ? "浮窗显示中" : "浮窗已隐藏"}</span>
              <span>{draft.desktopPetRoamingEnabled ? "允许巡逻" : "固定待机"}</span>
              <span>{status.isEnabled ? status.isDue ? "健康提醒待处理" : `${status.minutesUntilNext} 分钟后提醒` : "健康提醒关闭"}</span>
            </div>
            <div className="button-row">
              <button className="button primary" onClick={togglePetVisible}>
                {draft.desktopPetModeEnabled ? "隐藏小夜" : "显示小夜"}
              </button>
              <button className="button secondary" onClick={togglePetRoaming}>
                {draft.desktopPetRoamingEnabled ? "停止巡逻" : "让小夜巡逻"}
              </button>
            </div>
          </div>
        </article>

        <article className="panel form-section health-settings-card">
          <div className="section-heading">
            <span>01</span>
            <div>
              <h2>健康提醒</h2>
              <p>只在到点时让小夜弹出文字气泡；平时保持安静。</p>
            </div>
          </div>
          <details className="progressive-section" open>
            <summary>提醒规则</summary>
            <div className="form-grid">
              <div className="switch-row">
                <span>
                  <strong>启用健康提醒</strong>
                  <small>关闭后仍可手动记录喝水和站立。</small>
                </span>
                <button
                  className={draft.healthReminderEnabled ? "switch-toggle on" : "switch-toggle"}
                  type="button"
                  aria-pressed={draft.healthReminderEnabled}
                  onClick={() => patchDraft("healthReminderEnabled", !draft.healthReminderEnabled)}
                >
                  {draft.healthReminderEnabled ? "开" : "关"}
                </button>
              </div>
              <label>
                提醒间隔（分钟）
                <input
                  min="5"
                  max="240"
                  type="number"
                  value={draft.healthReminderIntervalMinutes}
                  onChange={(event) => patchDraft("healthReminderIntervalMinutes", Number(event.target.value))}
                />
              </label>
              <div className="button-row">
                <button className="button secondary" onClick={() => record("drink_water")}>我喝水了</button>
                <button className="button secondary" onClick={() => record("stand_up")}>我站起来了</button>
                <button className="button ghost" onClick={snooze}>15 分钟后提醒</button>
              </div>
              <div className="health-stats">
                <span>喝水 <strong>{health.waterCount}</strong> 次</span>
                <span>站立 <strong>{health.standCount}</strong> 次</span>
                <span>{status.isEnabled ? status.isDue ? "现在该动了" : `${status.minutesUntilNext} 分钟后` : "已关闭"}</span>
              </div>
            </div>
          </details>
          <details className="progressive-section">
            <summary>调皮模式</summary>
            <div className="switch-row">
              <span>
                <strong>调皮模式</strong>
                <small>超时太久时，文案会更像一只小兽在扒拉你。</small>
              </span>
              <button
                className={draft.naughtyModeEnabled ? "switch-toggle on" : "switch-toggle"}
                type="button"
                aria-pressed={draft.naughtyModeEnabled}
                onClick={() => patchDraft("naughtyModeEnabled", !draft.naughtyModeEnabled)}
              >
                {draft.naughtyModeEnabled ? "开" : "关"}
              </button>
            </div>
          </details>
          <details className="progressive-section">
            <summary>运行环境</summary>
            <p className="empty-state">
              当前：{getDesktopRuntimeLabel() === "tauri" ? "Tauri 桌面端，显示/隐藏会实时生效。" : "Web 预览，只保存设置。"}
            </p>
          </details>
          <div className="button-row form-actions">
            <button className="button ghost" onClick={resetToday}>重置今日记录</button>
            <button className="button primary" onClick={save}>保存</button>
          </div>
          {desktopHint && <p className="save-hint">{desktopHint}</p>}
        </article>
      </section>
    </>
  );
}
