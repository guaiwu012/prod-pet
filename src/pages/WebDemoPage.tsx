import { useState } from "react";
import exercisePet from "../assets/pet/exercise.png";
import happyPet from "../assets/pet/happy.png";
import workingPet from "../assets/pet/working.png";
import type { AppRoute } from "../app/routes";

interface WebDemoPageProps {
  onOpenWorkspace: (route?: AppRoute) => void;
}

const steps = [
  {
    eyebrow: "TAPD 项目雷达 · 10:06",
    title: "订单导出明天验收，但金额口径还卡着。",
    description: "小兽发现 DDL 只剩 1 天，而 TAPD 的阻塞项从昨天起没有更新。",
    action: "查看判断依据",
  },
  {
    eyebrow: "判断依据",
    title: "这不是一条固定闹钟。",
    description: "TAPD：明天进入验收 · 企微沟通：金额口径尚未确认 · 同事档案：林宇偏好「结论优先 + 明确截止时间」。",
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

  const focusDemo = () => {
    setStep(1);
    window.requestAnimationFrame(() => {
      document.getElementById("agent-demo")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

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
          <p className="eyebrow">住在桌面上的产品经理主动 Agent</p>
          <h1>项目不会突然失控。<br />它只是太久没人盯下一步。</h1>
          <p className="demo-lead">
            需求小兽把 TAPD 进度、企微沟通、同事偏好和你的工作节奏放在一起，
            主动告诉你：现在该推谁、怎么说，以及什么不能再等。
          </p>
          <div className="demo-loop" aria-label="Agent 工作闭环">
            <span>感知上下文</span><i>→</i>
            <span>判断优先级</span><i>→</i>
            <span>推动行动</span><i>→</i>
            <span>持续记忆</span>
          </div>
          <button className="button primary demo-start" onClick={focusDemo}>
            体验一次主动推进
          </button>
          <small className="demo-note">无需登录 · 数据仅保存在当前浏览器 · 演示约 40 秒</small>
        </div>

        <div className="demo-stage" id="agent-demo">
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
              <article className={`demo-agent-card step-${step}`} aria-live="polite">
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

      <section className="demo-pain-section">
        <div className="demo-section-heading">
          <p className="eyebrow">它替我一直记着</p>
          <h2>产品经理的四个“脑内后台”，交给一只小兽值班。</h2>
          <p>不是再做一个项目管理工具，而是把散落的信息变成今天真正可执行的下一步。</p>
        </div>

        <div className="demo-pain-grid">
          <article className="demo-pain-card project-radar">
            <div className="demo-pain-top">
              <span>01 · 项目雷达</span>
              <b>规划接入 TAPD</b>
            </div>
            <h3>我手头有什么项目，今天最该推哪一个？</h3>
            <p>自动汇总负责人、当前阶段、卡点、下一动作和 DDL，把“散落的一堆项目”排成今天的推进顺序。</p>
            <div className="mini-project-list">
              <div><i className="danger" /><strong>订单导出优化</strong><em>阻塞 · DDL 明天</em></div>
              <div><i className="warning" /><strong>会员权益改版</strong><em>待对齐 · DDL 5 天</em></div>
              <div><i className="safe" /><strong>发票体验优化</strong><em>开发中 · DDL 12 天</em></div>
            </div>
          </article>

          <article className="demo-pain-card colleague-push">
            <div className="demo-pain-top">
              <span>02 · 同事档案</span>
              <b className="ready">原型已实现</b>
            </div>
            <h3>同一件事，对不同的人要用不同的说法。</h3>
            <p>记住同事负责的模块、沟通偏好和历史配合方式，一键生成能直接发送的 Push 消息。</p>
            <div className="mini-profile">
              <div className="mini-avatar">林</div>
              <div><strong>林宇 · 后端</strong><span>结论优先 · 明确截止时间</span></div>
              <button onClick={() => onOpenWorkspace("dashboard")}>生成话术</button>
            </div>
          </article>

          <article className="demo-pain-card weekly-memory">
            <div className="demo-pain-top">
              <span>03 · 工作记忆</span>
              <b className="ready">原型已实现</b>
            </div>
            <h3>周五不再靠聊天记录回忆“我这周做了什么”。</h3>
            <p>把项目推进、沟通结论、风险和下周计划自动收拢，再按你的表达习惯生成周报初稿。</p>
            <div className="mini-report">
              <span>【本周工作进展】</span>
              <p>推进订单导出进入验收，完成接口联调；识别金额字段口径风险并推动三方对齐……</p>
              <button onClick={() => onOpenWorkspace("weekly")}>查看我的周报</button>
            </div>
          </article>

          <article className="demo-pain-card health-care">
            <div className="demo-pain-top">
              <span>04 · 状态照看</span>
              <b className="ready">桌面版已实现</b>
            </div>
            <h3>项目要推进，人也不能一直焊在椅子上。</h3>
            <p>感知连续工作时长，在合适的空档提醒喝水、站立和走动；不打断会议，也不会机械轰炸。</p>
            <div className="mini-health">
              <img src={exercisePet} alt="" />
              <div><strong>已经专注 72 分钟啦</strong><span>喝口水，陪我走两步？</span></div>
              <button onClick={() => onOpenWorkspace("health")}>我去走走</button>
            </div>
          </article>
        </div>
      </section>

      <section className="demo-vision">
        <div className="demo-vision-copy">
          <p className="eyebrow">下一阶段 · 主动感知</p>
          <h2>不再依赖手填记录，让小兽自己看见工作正在发生。</h2>
          <p>
            在用户明确授权和隐私边界内，接入工作系统与本地视觉理解。
            AI 不只回答问题，而是持续维护一张“项目—人—承诺—时间”的工作图谱。
          </p>
          <div className="demo-privacy-note">默认本地处理 · 按应用授权 · 敏感窗口可排除 · 每次行动可追溯</div>
        </div>
        <div className="demo-sense-map">
          <div className="sense-sources">
            <article><span>TAPD</span><strong>项目、状态、卡点、DDL</strong><small>API 授权后同步</small></article>
            <article><span>企业微信</span><strong>沟通结论与待承诺事项</strong><small>组织与用户授权后读取</small></article>
            <article><span>桌面截屏</span><strong>识别正在处理的工作上下文</strong><small>本地视觉模型，按应用排除</small></article>
          </div>
          <div className="sense-arrow">→</div>
          <div className="sense-pet">
            <img src={happyPet} alt="需求小兽整合工作上下文" />
            <strong>需求小兽</strong>
            <span>理解 · 判断 · 提醒 · 记录</span>
          </div>
          <div className="sense-arrow">→</div>
          <div className="sense-results">
            <span>今日项目雷达</span>
            <span>合适的 Push 话术</span>
            <span>个人口吻周报</span>
            <span>健康节奏提醒</span>
          </div>
        </div>
      </section>

      <section className="demo-final-cta">
        <img src={workingPet} alt="" />
        <div>
          <p className="eyebrow">需求小兽 / PushPet</p>
          <h2>你负责做判断，小兽负责让每件事都有下一步。</h2>
        </div>
        <button className="button primary" onClick={focusDemo}>体验主动推进</button>
      </section>
    </main>
  );
}
