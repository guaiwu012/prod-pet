import type { TaskType } from "../types";

export const taskLabels: Record<TaskType, string> = {
  write_prd: "搭需求文档骨架",
  align_dev: "找研发对需求",
  push_dev: "确认研发进度与卡点",
  acceptance: "按清单验收需求",
  weekly_report: "整理本周周报",
  drink_water: "喝水",
  stand_up: "起来活动",
};

export const taskCopy: Record<TaskType, string> = {
  write_prd: "先把背景、目标、入口、字段和验收口径列清楚，不必一开始就写得面面俱到。",
  align_dev: "今天适合找前端和后端过一遍需求，重点确认页面、接口、字段和异常状态。",
  push_dev: "建议先问卡点，不要直接问“做完了吗”。确认接口、字段、联调和排期风险。",
  acceptance: "带着 checklist 看入口展示、配置保存、状态回显、异常提示和埋点。",
  weekly_report: "把这周沟通过的需求、确认事项、卡点和下一步整理一下。",
  drink_water: "该喝水了，顺便让眼睛离开屏幕一会儿。",
  stand_up: "起来动一下，肩颈会感谢现在的你。",
};
