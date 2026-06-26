import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import type { AppConfig, AppData, WeekType } from "../types";

interface CycleConfigPageProps {
  data: AppData;
  updateData: (updater: (current: AppData) => AppData) => void;
}

const weekdayOptions = [
  { value: 1, label: "周一" },
  { value: 2, label: "周二" },
  { value: 3, label: "周三" },
  { value: 4, label: "周四" },
  { value: 5, label: "周五" },
  { value: 6, label: "周六" },
  { value: 0, label: "周日" },
];

export function CycleConfigPage({ data, updateData }: CycleConfigPageProps) {
  const [draft, setDraft] = useState<AppConfig>(data.config);
  const [holiday, setHoliday] = useState("");
  const [saved, setSaved] = useState(false);

  const patchDraft = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const toggleWorkday = (day: number) => {
    patchDraft(
      "workdays",
      draft.workdays.includes(day)
        ? draft.workdays.filter((item) => item !== day)
        : [...draft.workdays, day],
    );
  };

  const addHoliday = () => {
    if (!holiday || draft.holidays.includes(holiday)) return;
    patchDraft("holidays", [...draft.holidays, holiday].sort());
    setHoliday("");
  };

  const save = () => {
    updateData((current) => ({ ...current, config: draft }));
    setSaved(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="周期配置"
        title="把节奏定清楚，小兽才知道什么时候催你。"
        description="需求周从起始日期按周期自动轮换，也可以临时手动覆盖。"
        action={<button className="button primary" onClick={save}>{saved ? "已保存" : "保存配置"}</button>}
      />

      <div className="settings-grid">
        <section className="panel form-section">
          <div className="section-heading">
            <span>01</span>
            <div>
              <h2>需求周期</h2>
              <p>默认两周一轮，第一周视为需求周。</p>
            </div>
          </div>
          <div className="form-grid two-columns">
            <label>
              需求周起始日期
              <input
                type="date"
                value={draft.demandWeekStartDate}
                onChange={(event) => patchDraft("demandWeekStartDate", event.target.value)}
              />
            </label>
            <label>
              周期长度（周）
              <input
                min="1"
                max="12"
                type="number"
                value={draft.cycleLengthWeeks}
                onChange={(event) => patchDraft("cycleLengthWeeks", Number(event.target.value))}
              />
            </label>
            <label className="span-two">
              本周手动覆盖
              <select
                value={draft.manualWeekType ?? "auto"}
                onChange={(event) => patchDraft("manualWeekType", event.target.value as WeekType | "auto")}
              >
                <option value="auto">自动判断</option>
                <option value="demand_week">强制为需求周</option>
                <option value="non_demand_week">强制为非需求周</option>
              </select>
            </label>
          </div>
        </section>

        <section className="panel form-section">
          <div className="section-heading">
            <span>02</span>
            <div>
              <h2>工作与提醒时间</h2>
              <p>先记录偏好，后续桌面通知会读取这些设置。</p>
            </div>
          </div>
          <div className="form-grid two-columns">
            <label>
              开始工作
              <input type="time" value={draft.workStartTime} onChange={(event) => patchDraft("workStartTime", event.target.value)} />
            </label>
            <label>
              结束工作
              <input type="time" value={draft.workEndTime} onChange={(event) => patchDraft("workEndTime", event.target.value)} />
            </label>
            <label>
              每日提醒
              <input type="time" value={draft.reminderTime} onChange={(event) => patchDraft("reminderTime", event.target.value)} />
            </label>
            <label>
              周报提醒
              <input type="time" value={draft.weeklyReportReminderTime} onChange={(event) => patchDraft("weeklyReportReminderTime", event.target.value)} />
            </label>
          </div>
        </section>

        <section className="panel form-section wide-section">
          <div className="section-heading">
            <span>03</span>
            <div>
              <h2>工作日与假期</h2>
              <p>最后工作日会自动追加周报提醒。</p>
            </div>
          </div>
          <div className="weekday-picker">
            {weekdayOptions.map((option) => (
              <button
                className={draft.workdays.includes(option.value) ? "weekday active" : "weekday"}
                key={option.value}
                onClick={() => toggleWorkday(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="holiday-input">
            <label>
              手动添加假期
              <input type="date" value={holiday} onChange={(event) => setHoliday(event.target.value)} />
            </label>
            <button className="button secondary" onClick={addHoliday}>添加日期</button>
          </div>
          <div className="chip-list">
            {draft.holidays.map((date) => (
              <button
                className="holiday-chip"
                key={date}
                title="点击删除"
                onClick={() => patchDraft("holidays", draft.holidays.filter((item) => item !== date))}
              >
                {date} ×
              </button>
            ))}
            {!draft.holidays.length && <p className="empty-state">还没有手动添加假期。</p>}
          </div>
        </section>
      </div>
    </>
  );
}
