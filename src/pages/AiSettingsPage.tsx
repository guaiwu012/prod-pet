import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import type { AppConfig, AppData } from "../types";

interface AiSettingsPageProps {
  data: AppData;
  updateData: (updater: (current: AppData) => AppData) => void;
}

export function AiSettingsPage({ data, updateData }: AiSettingsPageProps) {
  const [draft, setDraft] = useState<AppConfig>(data.config);
  const [saved, setSaved] = useState(false);
  const hasKey = Boolean(data.config.deepseekApiKey?.trim());

  const updateDraft = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const save = () => {
    updateData((current) => ({
      ...current,
      config: {
        ...draft,
        deepseekApiKey: draft.deepseekApiKey?.trim(),
        deepseekBaseUrl: draft.deepseekBaseUrl.trim(),
        deepseekModel: draft.deepseekModel?.trim() || "deepseek-chat",
      },
    }));
    setSaved(true);
  };

  const clearKey = () => {
    setDraft((current) => ({ ...current, deepseekApiKey: "", aiEnabled: false }));
    updateData((current) => ({
      ...current,
      config: { ...current.config, deepseekApiKey: "", aiEnabled: false },
    }));
    setSaved(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="AI 设置"
        title="需要时聪明，不需要时安静。"
        description="MVP 会在未配置 Key、接口失败或关闭 AI 时自动使用本地规则生成，避免流程断掉。"
        action={<button className="button primary" onClick={save}>保存 AI 设置</button>}
      />

      <section className="settings-grid">
        <article className="panel form-section wide-section">
          <div className="section-heading">
            <span>AI</span>
            <div>
              <h2>DeepSeek 配置</h2>
              <p>API Key 仅保存在当前设备 localStorage；前端 MVP 不会把它打印到日志。</p>
            </div>
          </div>

          <div className="form-grid two-columns">
            <label className="switch-row span-two">
              <span>
                <strong>启用 AI 生成</strong>
                <small>{draft.aiEnabled ? "生成话术时会先请求 DeepSeek，失败则本地回退。" : "当前只使用本地规则，离线也可用。"}</small>
              </span>
              <input
                type="checkbox"
                checked={draft.aiEnabled}
                onChange={(event) => updateDraft("aiEnabled", event.target.checked)}
              />
            </label>
            <label>
              Base URL
              <input
                placeholder="https://api.deepseek.com/v1"
                value={draft.deepseekBaseUrl}
                onChange={(event) => updateDraft("deepseekBaseUrl", event.target.value)}
              />
            </label>
            <label>
              模型
              <input
                placeholder="deepseek-chat"
                value={draft.deepseekModel || ""}
                onChange={(event) => updateDraft("deepseekModel", event.target.value)}
              />
            </label>
            <label className="span-two">
              API Key
              <input
                type="password"
                placeholder={hasKey ? "已保存 Key；输入新 Key 可覆盖" : "sk-..."}
                value={draft.deepseekApiKey || ""}
                onChange={(event) => updateDraft("deepseekApiKey", event.target.value)}
              />
            </label>
          </div>

          <div className="button-row form-actions">
            <button className="button ghost" onClick={clearKey} disabled={!hasKey && !draft.deepseekApiKey}>清除 Key</button>
            <button className="button primary" onClick={save}>保存</button>
          </div>
          {saved && <p className="save-hint">已保存。小兽会在生成失败时自动切回本地话术，不会傻等接口。</p>}
        </article>

        <article className="panel form-section">
          <div className="section-heading">
            <span>安全</span>
            <div>
              <h2>MVP 阶段说明</h2>
              <p>桌面端正式版应把 Key 放到系统钥匙串或 Tauri 安全存储。</p>
            </div>
          </div>
          <p className="empty-state">
            目前为了快速验证产品闭环，Key 存在浏览器 localStorage。不要在共享电脑或录屏场景输入真实 Key。
          </p>
        </article>

        <article className="panel form-section">
          <div className="section-heading">
            <span>回退</span>
            <div>
              <h2>本地生成策略</h2>
              <p>会参考任务类型、需求周/非需求周、同事角色、模块和沟通偏好。</p>
            </div>
          </div>
          <p className="empty-state">
            这样即使没有网络或未配置 AI，MVP 也能完整跑完「提醒 → 话术 → 记录 → 周报」链路。
          </p>
        </article>
      </section>
    </>
  );
}
