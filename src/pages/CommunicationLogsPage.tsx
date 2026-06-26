import { useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import type { AppData, CommunicationLog, CommunicationStatus } from "../types";

interface CommunicationLogsPageProps {
  data: AppData;
  updateData: (updater: (current: AppData) => AppData) => void;
}

const statusLabels: Record<CommunicationStatus, string> = {
  draft: "草稿中",
  aligning: "对齐中",
  developing: "开发中",
  testing: "测试中",
  accepted: "已验收",
  launched: "已上线",
  blocked: "有阻塞",
};

const blankLog = (): CommunicationLog => ({
  id: "",
  demandName: "",
  colleagueId: "",
  colleagueName: "",
  time: new Date().toISOString().slice(0, 16),
  summary: "",
  status: "aligning",
  hasBlocker: false,
  blocker: "",
  nextAction: "",
});

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function toInputTime(isoTime: string): string {
  if (!isoTime) return new Date().toISOString().slice(0, 16);
  return isoTime.slice(0, 16);
}

function toDisplayTime(isoTime: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoTime));
}

export function CommunicationLogsPage({ data, updateData }: CommunicationLogsPageProps) {
  const [editing, setEditing] = useState<CommunicationLog>(() => blankLog());
  const [demandFilter, setDemandFilter] = useState("");
  const [colleagueFilter, setColleagueFilter] = useState("");

  const demandOptions = useMemo(
    () => Array.from(new Set(data.communicationLogs.map((log) => log.demandName).filter(Boolean))),
    [data.communicationLogs],
  );

  const filteredLogs = useMemo(() => (
    data.communicationLogs
      .filter((log) => !demandFilter || log.demandName === demandFilter)
      .filter((log) => !colleagueFilter || log.colleagueId === colleagueFilter)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  ), [colleagueFilter, data.communicationLogs, demandFilter]);

  const selectColleague = (id: string) => {
    const colleague = data.colleagues.find((item) => item.id === id);
    setEditing({
      ...editing,
      colleagueId: id,
      colleagueName: colleague?.name || "",
    });
  };

  const startEdit = (log: CommunicationLog) => {
    setEditing({ ...log, time: toInputTime(log.time) });
  };

  const resetForm = () => {
    setEditing(blankLog());
  };

  const save = () => {
    if (!editing.demandName.trim() || !editing.summary.trim()) return;
    const selected = data.colleagues.find((colleague) => colleague.id === editing.colleagueId);
    const log: CommunicationLog = {
      ...editing,
      id: editing.id || createId(),
      demandName: editing.demandName.trim(),
      colleagueName: selected?.name || editing.colleagueName || "未指定同事",
      time: new Date(editing.time).toISOString(),
      summary: editing.summary.trim(),
      blocker: editing.hasBlocker ? editing.blocker?.trim() : "",
      nextAction: editing.nextAction?.trim(),
    };

    updateData((current) => ({
      ...current,
      communicationLogs: current.communicationLogs.some((item) => item.id === log.id)
        ? current.communicationLogs.map((item) => item.id === log.id ? log : item)
        : [...current.communicationLogs, log],
    }));
    resetForm();
  };

  const remove = (id: string) => {
    updateData((current) => ({
      ...current,
      communicationLogs: current.communicationLogs.filter((log) => log.id !== id),
    }));
  };

  return (
    <>
      <PageHeader
        eyebrow="沟通记录"
        title="让每次同步都有下文。"
        description="记录需求、同事、状态、卡点和下一步，周报会直接复用这些信息。"
      />

      <section className="panel log-form">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{editing.id ? "编辑记录" : "新增记录"}</p>
            <h2>{editing.id ? "修正这次同步的结论" : "把刚聊完的结论放进笼子里"}</h2>
          </div>
          {editing.id && <button className="button ghost" onClick={resetForm}>改为新增</button>}
        </div>
        <div className="form-grid two-columns">
          <label>
            需求名 *
            <input
              placeholder="例如：订单导出优化"
              value={editing.demandName}
              onChange={(event) => setEditing({ ...editing, demandName: event.target.value })}
            />
          </label>
          <label>
            沟通时间
            <input
              type="datetime-local"
              value={editing.time}
              onChange={(event) => setEditing({ ...editing, time: event.target.value })}
            />
          </label>
          <label>
            同事
            <select value={editing.colleagueId} onChange={(event) => selectColleague(event.target.value)}>
              <option value="">未指定</option>
              {data.colleagues.map((colleague) => (
                <option key={colleague.id} value={colleague.id}>{colleague.name}</option>
              ))}
            </select>
          </label>
          <label>
            状态
            <select
              value={editing.status}
              onChange={(event) => setEditing({ ...editing, status: event.target.value as CommunicationStatus })}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="span-two">
            沟通结论 *
            <textarea
              placeholder="例如：后端接口本周三前可联调，字段命名需要补充到 PRD"
              value={editing.summary}
              onChange={(event) => setEditing({ ...editing, summary: event.target.value })}
            />
          </label>
          <label className="switch-row span-two">
            <span>
              <strong>存在卡点</strong>
              <small>卡点会被周报自动归到风险与阻塞。</small>
            </span>
            <input
              type="checkbox"
              checked={editing.hasBlocker}
              onChange={(event) => setEditing({ ...editing, hasBlocker: event.target.checked, status: event.target.checked ? "blocked" : editing.status })}
            />
          </label>
          {editing.hasBlocker && (
            <label className="span-two">
              卡点描述
              <textarea
                placeholder="例如：数据源口径未定，需要数据同学确认"
                value={editing.blocker}
                onChange={(event) => setEditing({ ...editing, blocker: event.target.value })}
              />
            </label>
          )}
          <label className="span-two">
            下一步
            <input
              placeholder="例如：明天 15:00 前补齐验收标准并发群确认"
              value={editing.nextAction}
              onChange={(event) => setEditing({ ...editing, nextAction: event.target.value })}
            />
          </label>
        </div>
        <div className="button-row form-actions">
          <button className="button ghost" onClick={resetForm}>清空</button>
          <button className="button primary" disabled={!editing.demandName.trim() || !editing.summary.trim()} onClick={save}>
            {editing.id ? "保存修改" : "保存记录"}
          </button>
        </div>
      </section>

      <section className="panel log-filters">
        <label>
          按需求筛选
          <select value={demandFilter} onChange={(event) => setDemandFilter(event.target.value)}>
            <option value="">全部需求</option>
            {demandOptions.map((demand) => <option key={demand} value={demand}>{demand}</option>)}
          </select>
        </label>
        <label>
          按同事筛选
          <select value={colleagueFilter} onChange={(event) => setColleagueFilter(event.target.value)}>
            <option value="">全部同事</option>
            {data.colleagues.map((colleague) => <option key={colleague.id} value={colleague.id}>{colleague.name}</option>)}
          </select>
        </label>
        <button className="button ghost" onClick={() => { setDemandFilter(""); setColleagueFilter(""); }}>重置筛选</button>
      </section>

      <section className="log-list">
        {filteredLogs.map((log) => (
          <article className="panel log-card" key={log.id}>
            <div className="log-card-head">
              <div>
                <p className="eyebrow">{toDisplayTime(log.time)} · {log.colleagueName}</p>
                <h2>{log.demandName}</h2>
              </div>
              <span className={`status-chip ${log.status}`}>{statusLabels[log.status]}</span>
            </div>
            <p>{log.summary}</p>
            {log.hasBlocker && <p className="blocker-line">卡点：{log.blocker || "未填写具体卡点"}</p>}
            {log.nextAction && <p className="next-action-line">下一步：{log.nextAction}</p>}
            <div className="card-actions">
              <button onClick={() => startEdit(log)}>编辑</button>
              <button className="danger-link" onClick={() => remove(log.id)}>删除</button>
            </div>
          </article>
        ))}
        {!filteredLogs.length && (
          <article className="panel empty-page">
            <span>LOG</span>
            <h2>还没有匹配的沟通记录</h2>
            <p>先保存一条记录；以后周五生成周报时，小兽就不用靠玄学回忆了。</p>
          </article>
        )}
      </section>
    </>
  );
}
