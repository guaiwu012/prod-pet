import { isTauri } from "@tauri-apps/api/core";
import { emitTo } from "@tauri-apps/api/event";
import { useEffect, useMemo, useState } from "react";
import type { AppRoute } from "../app/routes";
import { PageHeader } from "../components/PageHeader";
import { PetWidget } from "../components/PetWidget";
import { getHealthStatus, normalizeHealthState, recordHealthAction, snoozeHealthReminder } from "../domain/healthEngine";
import { buildPromptForAiMessage, generateLocalMessage } from "../domain/messageGenerator";
import { getTodayReminder } from "../domain/reminderEngine";
import { taskCopy, taskLabels } from "../domain/reminderCopy";
import { completeTextWithFallback } from "../services/aiClient";
import type { AppData, Colleague, TaskType } from "../types";

interface DashboardPageProps {
  data: AppData;
  updateData: (updater: (current: AppData) => AppData) => void;
  onNavigate: (route: AppRoute) => void;
}

function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

export function DashboardPage({ data, updateData, onNavigate }: DashboardPageProps) {
  const today = useMemo(() => new Date(), []);
  const reminder = useMemo(() => getTodayReminder(data.config, today), [data.config, today]);
  const health = useMemo(() => normalizeHealthState(data.health, today), [data.health, today]);
  const healthStatus = useMemo(() => getHealthStatus(data.config, health, today), [data.config, health, today]);
  const [copyState, setCopyState] = useState("复制建议");
  const [messageCopyState, setMessageCopyState] = useState("复制话术");
  const [selectedColleagueId, setSelectedColleagueId] = useState("");
  const [demandName, setDemandName] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskType>("push_dev");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const dateKey = toLocalDateString(today);
  const completed = data.completedDates.includes(dateKey);
  const selectableTasks = (reminder.tasks.length ? reminder.tasks : ["push_dev", "acceptance", "weekly_report"]) as TaskType[];
  const selectedColleague: Colleague | undefined = data.colleagues.find((colleague) => colleague.id === selectedColleagueId);
  const message = reminder.tasks.length
    ? taskCopy[reminder.tasks[0]]
    : reminder.isWorkday
      ? "今天没有固定流程任务，适合清掉一个悬着的小卡点。"
      : "今天不是工作日。放心休息，小兽替你守着需求。";

  const notifyPetHealthUpdated = () => {
    if (!isTauri()) return;
    window.setTimeout(() => {
      void emitTo("pet", "pushpet://health-updated", {});
    }, 0);
  };

  useEffect(() => {
    if (!selectableTasks.includes(selectedTask)) {
      setSelectedTask(selectableTasks[0]);
    }
  }, [selectableTasks, selectedTask]);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setCopyState("已复制");
    window.setTimeout(() => setCopyState("复制建议"), 1400);
  };

  const toggleComplete = () => {
    updateData((current) => ({
      ...current,
      completedDates: completed
        ? current.completedDates.filter((date) => date !== dateKey)
        : [...current.completedDates, dateKey],
    }));
  };

  const recordHealth = (action: "drink_water" | "stand_up") => {
    updateData((current) => ({ ...current, health: recordHealthAction(current.health, action) }));
    notifyPetHealthUpdated();
  };

  const snoozeHealth = () => {
    updateData((current) => ({ ...current, health: snoozeHealthReminder(current.health, 15) }));
    notifyPetHealthUpdated();
  };

  const generateMessage = async () => {
    setIsGenerating(true);
    const fallback = generateLocalMessage({
      task: selectedTask,
      colleague: selectedColleague,
      demandName,
      weekType: reminder.weekType,
      config: data.config,
    });
    const prompt = buildPromptForAiMessage({
      task: selectedTask,
      colleague: selectedColleague,
      demandName,
      weekType: reminder.weekType,
      config: data.config,
    });
    const result = await completeTextWithFallback({
      config: data.config,
      fallback,
      messages: [
        { role: "system", content: "你是一个帮产品经理推进需求的小助手，输出清晰、温和、可执行。" },
        { role: "user", content: prompt },
      ],
    });
    setGeneratedMessage(result);
    setIsGenerating(false);
  };

  const copyGeneratedMessage = async () => {
    await navigator.clipboard.writeText(generatedMessage);
    setMessageCopyState("已复制");
    window.setTimeout(() => setMessageCopyState("复制话术"), 1400);
  };

  return (
    <>
      <PageHeader
        eyebrow="今日任务"
        title="今天也把事情往前拱一点。"
        description={dateFormatter.format(today)}
        action={
          <span className={`week-badge ${reminder.weekType}`}>
            {reminder.weekType === "demand_week" ? "需求周" : "非需求周"}
          </span>
        }
      />

      <section className="hero-grid">
        <PetWidget message={message} weekType={reminder.weekType} />
        <article className="panel task-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">今日清单</p>
              <h2>{reminder.tasks.length ? `${reminder.tasks.length} 件值得推进` : "没有固定提醒"}</h2>
            </div>
            <span className={completed ? "done-chip completed" : "done-chip"}>
              {completed ? "今日已完成" : "推进中"}
            </span>
          </div>

          <div className="task-list">
            {reminder.tasks.map((task) => (
              <div className="task-item" key={task}>
                <span className="task-dot" />
                <div>
                  <strong>{taskLabels[task]}</strong>
                  <p>{taskCopy[task]}</p>
                </div>
              </div>
            ))}
            {!reminder.tasks.length && (
              <p className="empty-state">没有任务，或者今天被设为假期。</p>
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-bottom">
        <article className="panel suggestion-card">
          <p className="eyebrow">建议怎么说</p>
          <blockquote>{message}</blockquote>
          <div className="button-row">
            <button className="button secondary" onClick={copyMessage}>{copyState}</button>
            <button className="button ghost" onClick={() => onNavigate("colleagues")}>
              选择沟通同事
            </button>
          </div>
        </article>
        <article className="panel progress-card">
          <p className="eyebrow">今日收尾</p>
          <h2>{completed ? "漂亮，今天有交代了。" : "做完后给小兽一个准信。"}</h2>
          <button className="button primary" onClick={toggleComplete}>
            {completed ? "撤销完成" : "标记今日已完成"}
          </button>
        </article>
      </section>

      <section className={`panel health-strip ${healthStatus.mood}`}>
        <div>
          <p className="eyebrow">健康小兽</p>
          <h2>{healthStatus.message}</h2>
          <p>今日喝水 {health.waterCount} 次 · 站立 {health.standCount} 次</p>
        </div>
        <div className="button-row">
          <button className="button secondary" onClick={() => recordHealth("drink_water")}>喝水了</button>
          <button className="button secondary" onClick={() => recordHealth("stand_up")}>站起来了</button>
          <button className="button ghost" onClick={snoozeHealth}>稍后提醒</button>
          <button className="button ghost" onClick={() => onNavigate("health")}>设置</button>
        </div>
      </section>

      <section className="panel message-workbench">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">沟通话术生成</p>
            <h2>选一个需求和同事，小兽帮你起草第一句话。</h2>
          </div>
          {data.config.aiEnabled ? <span className="ai-chip">AI 已开启，失败自动本地回退</span> : <span className="ai-chip muted">本地规则生成</span>}
        </div>
        <div className="form-grid three-columns">
          <label>
            需求名
            <input
              placeholder="例如：订单导出优化"
              value={demandName}
              onChange={(event) => setDemandName(event.target.value)}
            />
          </label>
          <label>
            沟通同事
            <select value={selectedColleagueId} onChange={(event) => setSelectedColleagueId(event.target.value)}>
              <option value="">暂不指定</option>
              {data.colleagues.map((colleague) => (
                <option key={colleague.id} value={colleague.id}>{colleague.name}</option>
              ))}
            </select>
          </label>
          <label>
            任务类型
            <select value={selectedTask} onChange={(event) => setSelectedTask(event.target.value as TaskType)}>
              {selectableTasks.map((task) => (
                <option key={task} value={task}>{taskLabels[task]}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="button-row form-actions">
          <button className="button ghost" onClick={() => onNavigate("logs")}>去记录沟通</button>
          <button className="button primary" disabled={isGenerating} onClick={generateMessage}>
            {isGenerating ? "生成中..." : "生成沟通话术"}
          </button>
        </div>
        {generatedMessage && (
          <div className="generated-message">
            <pre>{generatedMessage}</pre>
            <button className="button secondary" onClick={copyGeneratedMessage}>{messageCopyState}</button>
          </div>
        )}
      </section>
    </>
  );
}
