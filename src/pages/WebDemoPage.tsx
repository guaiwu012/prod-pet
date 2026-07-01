import { useState } from "react";
import workingPet from "../assets/pet/working.png";
import type { AppRoute } from "../app/routes";

interface WebDemoPageProps {
  onOpenWorkspace: (route?: AppRoute) => void;
}

const steps = [
  {
    eyebrow: "主动发现 · 10:06",
    title: "订单导出明天验收，但一个口径还没定。",
    description: "小兽结合需求阶段、沟通记录和截止时间，发现这个卡点今天不能再等。",
    action: "查看判断依据",
  },
  {
    eyebrow: "判断依据",
    title: "这不是一条固定闹钟。",
    description: "明天进入验收 · 金额空值口径仍阻塞 · 林宇偏好「结论优先 + 明确截止时间」。",
    action: "生成跟进话术",
  },
  {
    eyebrow: "行动建议",
    title: "可以直接发给林宇",
    description: "结论先说：订单导出明天进入验收，现在只差金额空值口径。麻烦今天 15:00 前确认用「--」还是「0.00」，我收到后马上同步测试。",
    action: "模拟已发送",
  },
  {
    eyebrow: "闭环完成",
    title: "已记住结果，也安排好了下一次检查。",
    description: "沟通已归档到「订单导出优化」，若明天 15:00 前仍无结论，小兽会再次主动跟进。",
    action: "查看自动周报",
  },
];

export function WebDemoPage({ onOpenWorkspace }: WebDemoPageProps) {
  const [step, setStep] = useState(0);
  const current = steps[step];

  const advance = () => {
    if (step === steps.length - 1) {
      onOpenWorkspace("weekly");
      return;
    }
    setStep((value) => value + 1);
  };

  return (
    <main className="demo-page">
      <header className="demo-nav">
        <button className="demo-brand" onClick={() => setStep(0)}>
          <span>●ω●</span>
          <strong>需求小兽</strong>
        </button>
        <div className="demo-nav-actions">
          <span className="demo-badge">AI 黑客松 · Web 演示</span>
          <button className="button ghost" onClick={() => onOpenWorkspace()}>进入完整工作台</button>
        </div>
      </header>

      <section className="demo-hero">
        <div className="demo-intro">
          <p className="eyebrow">住在桌面上的产品经理 Agent</p>
          <h1>大多数 AI 等你开口。<br />小兽先发现什么不能再等。</h1>
          <p className="demo-lead">
            它理解需求周期、同事偏好和历史进展，主动发现卡点、推动下一步，
            再把每次沟通沉淀成可追踪的工作记忆。
          </p>
          <div className="demo-loop" aria-label="Agent 工作闭环">
            <span>感知上下文</span><i>→</i>
            <span>判断优先级</span><i>→</i>
            <span>推动行动</span><i>→</i>
            <span>持续记忆</span>
          </div>
          <button className="button primary demo-start" onClick={() => setStep(0)}>
            体验一次主动推进
          </button>
          <small className="demo-note">无需登录 · 数据仅保存在当前浏览器 · 演示约 40 秒</small>
        </div>

        <div className="demo-stage">
          <div className="demo-desktop">
            <div className="demo-window-bar">
              <div><i /><i /><i /></div>
              <span>产品经理的工作桌面</span>
              <em>10:06</em>
            </div>
            <div className="demo-workspace">
              <div className="demo-work-header">
                <div>
                  <small>今日重点</small>
                  <strong>订单导出优化</strong>
                </div>
                <span>明日验收</span>
              </div>
              <div className="demo-task-row done"><i />接口联调完成 <b>已完成</b></div>
              <div className="demo-task-row blocked"><i />金额空值口径 <b>有阻塞</b></div>
              <div className="demo-task-row"><i />同步测试验收 <b>待进行</b></div>
            </div>

            <div className="demo-pet-agent">
              <article className={`demo-agent-card step-${step}`}>
                <p>{current.eyebrow}</p>
                <h2>{current.title}</h2>
                <div className="demo-agent-copy">{current.description}</div>
                <div className="demo-progress" aria-label={`演示步骤 ${step + 1}/4`}>
                  {steps.map((_, index) => <i className={index <= step ? "active" : ""} key={index} />)}
                </div>
                <button className="button primary" onClick={advance}>{current.action}</button>
              </article>
              <img src={workingPet} alt="需求小兽主动提醒" />
            </div>
          </div>
        </div>
      </section>

      <section className="demo-capabilities">
        <article><span>01</span><h2>主动，而非等待提问</h2><p>在需求该推进、阻塞该升级、周报该整理时主动出现。</p></article>
        <article><span>02</span><h2>懂事，也懂人</h2><p>同时理解需求阶段和同事沟通偏好，给出真正能发送的话术。</p></article>
        <article><span>03</span><h2>每次沟通都有下文</h2><p>结论、风险和下一步持续进入记忆，最终自动形成周报。</p></article>
      </section>
    </main>
  );
}
