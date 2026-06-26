import type { AppConfig, Colleague, TaskType, WeekType } from "../types";
import { taskLabels } from "./reminderCopy";

interface GenerateMessageInput {
  task: TaskType;
  colleague?: Colleague;
  demandName: string;
  weekType: WeekType;
  config: AppConfig;
}

const roleHints: Record<string, string> = {
  frontend: "麻烦重点看一下页面交互、边界状态和联调风险。",
  backend: "麻烦重点看一下接口口径、数据依赖和排期风险。",
  data: "麻烦重点看一下埋点/数据口径，以及是否需要提前确认取数方式。",
  qa: "麻烦重点看一下验收范围、测试用例和容易漏掉的边界。",
  other: "麻烦帮我看一下你这边相关的影响点。",
};

const taskOpeners: Record<TaskType, string> = {
  write_prd: "我在整理这版 PRD，想先把关键信息对齐一下",
  align_dev: "这版需求准备进入开发对齐，我想提前确认实现和排期",
  push_dev: "我来同步一下当前开发进展，顺便看看有没有卡点",
  acceptance: "我准备推进验收，想确认一下当前状态和剩余问题",
  weekly_report: "我在整理本周进展，想补齐你这边的状态",
  drink_water: "小提醒：起来喝口水，顺便让脑子刷新一下",
  stand_up: "小提醒：站起来活动一下，别让肩颈替需求背锅",
};

function compactList(items: string[]): string {
  return items.filter(Boolean).join("、");
}

function ensureChineseSentence(text: string): string {
  const trimmed = text.trim();
  return /[。！？!?]$/.test(trimmed) ? trimmed : `${trimmed}。`;
}

export function generateLocalMessage(input: GenerateMessageInput): string {
  const { task, colleague, demandName, weekType } = input;
  const name = colleague?.name || "同学";
  const demand = demandName.trim() || "当前需求";
  const modules = colleague?.modules.length ? `你负责的 ${compactList(colleague.modules)} 这块` : "你负责的部分";
  const roleHint = colleague ? roleHints[colleague.role] : "麻烦帮我看一下你这边相关的影响点。";
  const tagHint = colleague?.communicationTags.length
    ? `我会按你的沟通偏好来：${compactList(colleague.communicationTags)}。`
    : "";
  const manualHint = colleague?.manualProfile ? `我记得你这边偏好：${ensureChineseSentence(colleague.manualProfile)}` : "";
  const weekHint = weekType === "demand_week" ? "这周是需求周，我会尽量把背景和决策点讲清楚。" : "这周是推进周，我会尽量聚焦状态、卡点和下一步。";

  if (task === "drink_water" || task === "stand_up") {
    return taskOpeners[task];
  }

  const questionsByTask: Record<TaskType, string[]> = {
    write_prd: [
      `这版「${demand}」里，${modules}有没有我需要提前写进 PRD 的约束？`,
      "如果有你担心的边界条件，我先补到文档里，避免后面反复改。",
    ],
    align_dev: [
      `「${demand}」准备对齐实现方案，${modules}这边有没有排期或依赖风险？`,
      "我想今天先把范围、接口/页面口径和验收标准确认掉。",
    ],
    push_dev: [
      `「${demand}」现在推进到哪一步了？${modules}这边有没有需要我协调的卡点？`,
      "如果有阻塞，我可以先去补信息、拉人或调整优先级。",
    ],
    acceptance: [
      `「${demand}」我准备开始验收，${modules}这边目前是否已经可测？`,
      "麻烦同步一下已完成项、待修问题，以及有没有不建议今天验收的风险。",
    ],
    weekly_report: [
      `我在整理「${demand}」本周进展，想确认${modules}的当前状态。`,
      "可以给我一句话同步：完成了什么、还卡在哪里、下周下一步是什么吗？",
    ],
    drink_water: [taskOpeners.drink_water],
    stand_up: [taskOpeners.stand_up],
  };

  return [
    `${name}，${taskOpeners[task]}。`,
    weekHint,
    roleHint,
    tagHint,
    manualHint,
    ...questionsByTask[task],
    "我这边会把结论记下来，后续按明确下一步推进。",
  ].filter(Boolean).join("\n");
}

export function buildPromptForAiMessage(input: GenerateMessageInput): string {
  const { task, colleague, demandName, weekType } = input;
  return [
    "你是一个产品经理桌面小宠物的沟通助手。请生成一段中文、礼貌、直接、可复制到飞书/微信的沟通话术。",
    `需求：${demandName || "未命名需求"}`,
    `任务：${taskLabels[task] || task}`,
    `周类型：${weekType === "demand_week" ? "需求周" : "非需求周"}`,
    colleague ? `同事：${colleague.name}，角色：${colleague.role}` : "同事：未选择",
    colleague?.modules.length ? `负责模块：${compactList(colleague.modules)}` : "",
    colleague?.communicationTags.length ? `沟通偏好：${compactList(colleague.communicationTags)}` : "",
    colleague?.manualProfile ? `手动说明：${colleague.manualProfile}` : "",
    "要求：不超过 180 字；先说目的，再列需要确认的 2-3 点；不要夸张客套。",
  ].filter(Boolean).join("\n");
}
