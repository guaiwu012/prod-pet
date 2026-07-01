import type { AppData } from "../types";
import { defaultData } from "./defaultData";

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setHours(10, 0, 0, 0);
  result.setDate(result.getDate() - day + 1);
  return result;
}

function addDays(date: Date, days: number, hour: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(hour, 0, 0, 0);
  return result.toISOString();
}

export function buildDemoData(): AppData {
  const monday = startOfWeek(new Date());

  return {
    ...JSON.parse(JSON.stringify(defaultData)) as AppData,
    config: {
      ...defaultData.config,
      manualWeekType: "demand_week",
      aiEnabled: false,
    },
    colleagues: [
      {
        id: "demo-lin",
        name: "林宇",
        role: "backend",
        modules: ["订单", "导出服务"],
        communicationTags: ["结论优先", "需要明确截止时间"],
        manualProfile: "喜欢先看结论和明确的行动项，避免大段背景说明。",
        useAiProfile: false,
      },
      {
        id: "demo-zhou",
        name: "周然",
        role: "qa",
        modules: ["订单", "验收"],
        communicationTags: ["关注边界条件", "偏好清单"],
        manualProfile: "验收前希望收到结构化用例和清晰的口径说明。",
        useAiProfile: false,
      },
    ],
    communicationLogs: [
      {
        id: "demo-log-1",
        demandName: "订单导出优化",
        colleagueId: "demo-lin",
        colleagueName: "林宇",
        time: addDays(monday, 0, 11),
        summary: "导出接口已完成联调，预计周四进入验收。",
        status: "developing",
        hasBlocker: false,
        nextAction: "周三 15:00 前确认导出字段最终口径",
      },
      {
        id: "demo-log-2",
        demandName: "订单导出优化",
        colleagueId: "demo-zhou",
        colleagueName: "周然",
        time: addDays(monday, 1, 16),
        summary: "验收用例已准备，但金额字段的空值口径仍未确认。",
        status: "blocked",
        hasBlocker: true,
        blocker: "金额字段为空时展示「--」还是「0.00」尚未定稿。",
        nextAction: "今天下班前拉齐产品、后端与测试口径",
      },
      {
        id: "demo-log-3",
        demandName: "会员权益改版",
        colleagueId: "demo-lin",
        colleagueName: "林宇",
        time: addDays(monday, 2, 10),
        summary: "接口字段已对齐，下周一开始开发。",
        status: "aligning",
        hasBlocker: false,
        nextAction: "补齐降级策略后同步最终 PRD",
      },
    ],
  };
}
