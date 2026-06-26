import type { CommunicationLog } from "../types";

const statusLabels: Record<string, string> = {
  draft: "草稿中",
  aligning: "对齐中",
  developing: "开发中",
  testing: "测试中",
  accepted: "已验收",
  launched: "已上线",
  blocked: "有阻塞",
};

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - day + 1);
  return result;
}

export function isLogInCurrentWeek(log: CommunicationLog, now = new Date()): boolean {
  const time = new Date(log.time);
  const start = startOfWeek(now);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return time >= start && time < end;
}

export function getCurrentWeekLogs(logs: CommunicationLog[], now = new Date()): CommunicationLog[] {
  return logs
    .filter((log) => isLogInCurrentWeek(log, now))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

export function generateWeeklyReport(logs: CommunicationLog[]): string {
  if (!logs.length) {
    return "本周暂无沟通记录。\n\n建议：补充本周关键需求、已对齐事项、阻塞和下周计划后再生成周报。";
  }

  const demandMap = logs.reduce<Record<string, CommunicationLog[]>>((acc, log) => {
    const key = log.demandName || "未命名需求";
    acc[key] = acc[key] ? [...acc[key], log] : [log];
    return acc;
  }, {});

  const completed = logs.filter((log) => ["accepted", "launched"].includes(log.status));
  const blockers = logs.filter((log) => log.hasBlocker || log.status === "blocked");
  const nextActions = logs.map((log) => log.nextAction?.trim()).filter(Boolean);

  const progressLines = Object.entries(demandMap).map(([demand, demandLogs]) => {
    const latest = demandLogs[demandLogs.length - 1];
    const people = Array.from(new Set(demandLogs.map((log) => log.colleagueName).filter(Boolean))).join("、");
    const summaries = demandLogs.map((log) => log.summary.trim()).filter(Boolean).slice(-3).join("；");
    return `- ${demand}：已与${people || "相关同事"}同步，当前状态「${statusLabels[latest.status] || latest.status}」。${summaries || "本周完成了一轮状态确认。"}`;
  });

  return [
    "【本周工作进展】",
    ...progressLines,
    "",
    "【已完成/有结论】",
    completed.length
      ? completed.map((log) => `- ${log.demandName}：${log.summary || statusLabels[log.status]}`).join("\n")
      : "- 暂无明确完成项，主要在需求对齐与推进中。",
    "",
    "【风险与阻塞】",
    blockers.length
      ? blockers.map((log) => `- ${log.demandName}：${log.blocker || log.summary || "存在待协调阻塞"}`).join("\n")
      : "- 暂无明确阻塞。",
    "",
    "【下周计划】",
    nextActions.length
      ? Array.from(new Set(nextActions)).map((action) => `- ${action}`).join("\n")
      : "- 继续推进未完成需求，补齐验收口径并跟进剩余卡点。",
  ].join("\n");
}
