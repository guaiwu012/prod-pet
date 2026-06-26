import { useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { generateWeeklyReport, getCurrentWeekLogs } from "../domain/weeklyReportGenerator";
import type { AppData } from "../types";

interface WeeklyReportPageProps {
  data: AppData;
}

export function WeeklyReportPage({ data }: WeeklyReportPageProps) {
  const [copyState, setCopyState] = useState("复制周报");
  const weekLogs = useMemo(() => getCurrentWeekLogs(data.communicationLogs), [data.communicationLogs]);
  const report = useMemo(() => generateWeeklyReport(weekLogs), [weekLogs]);
  const blockerCount = weekLogs.filter((log) => log.hasBlocker || log.status === "blocked").length;
  const demandCount = new Set(weekLogs.map((log) => log.demandName)).size;

  const copyReport = async () => {
    await navigator.clipboard.writeText(report);
    setCopyState("已复制");
    window.setTimeout(() => setCopyState("复制周报"), 1400);
  };

  return (
    <>
      <PageHeader
        eyebrow="周报生成"
        title="别再靠周五下午回忆这一周。"
        description="当前版本先用本地规则从本周沟通记录生成中文草稿，后续可接入 AI 润色。"
        action={<button className="button primary" onClick={copyReport}>{copyState}</button>}
      />

      <section className="weekly-metrics">
        <article className="panel metric-card">
          <span>本周沟通</span>
          <strong>{weekLogs.length}</strong>
        </article>
        <article className="panel metric-card">
          <span>涉及需求</span>
          <strong>{demandCount}</strong>
        </article>
        <article className="panel metric-card">
          <span>风险/阻塞</span>
          <strong>{blockerCount}</strong>
        </article>
      </section>

      <section className="panel report-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">周报草稿</p>
            <h2>可复制后再做人工微调。</h2>
          </div>
        </div>
        <pre>{report}</pre>
      </section>

      <section className="panel report-source">
        <p className="eyebrow">来源记录</p>
        {weekLogs.length ? (
          <div className="source-list">
            {weekLogs.map((log) => (
              <div key={log.id}>
                <strong>{log.demandName}</strong>
                <span>{log.colleagueName} · {log.summary}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">本周还没有记录。先到「沟通记录」里保存几条，周报会立刻变得有血有肉。</p>
        )}
      </section>
    </>
  );
}
