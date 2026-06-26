import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import type { AppData, Colleague, ColleagueRole } from "../types";

interface ColleaguesPageProps {
  data: AppData;
  updateData: (updater: (current: AppData) => AppData) => void;
}

const roleLabels: Record<ColleagueRole, string> = {
  frontend: "前端",
  backend: "后端",
  data: "数据",
  qa: "测试",
  other: "其他",
};

const communicationTags = [
  "直接说结论",
  "需要完整背景",
  "喜欢 checklist",
  "不喜欢临时改需求",
  "适合先问卡点",
  "适合给明确 deadline",
  "需要提前发文档",
];

const blankColleague = (): Colleague => ({
  id: "",
  name: "",
  role: "frontend",
  modules: [],
  communicationTags: [],
  manualProfile: "",
  useAiProfile: false,
  notes: "",
});

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function ColleaguesPage({ data, updateData }: ColleaguesPageProps) {
  const [editing, setEditing] = useState<Colleague | null>(null);
  const [moduleText, setModuleText] = useState("");

  const startCreate = () => {
    setEditing(blankColleague());
    setModuleText("");
  };

  const startEdit = (colleague: Colleague) => {
    setEditing({ ...colleague, modules: [...colleague.modules], communicationTags: [...colleague.communicationTags] });
    setModuleText(colleague.modules.join("、"));
  };

  const toggleTag = (tag: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      communicationTags: editing.communicationTags.includes(tag)
        ? editing.communicationTags.filter((item) => item !== tag)
        : [...editing.communicationTags, tag],
    });
  };

  const save = () => {
    if (!editing?.name.trim()) return;
    const colleague = {
      ...editing,
      id: editing.id || createId(),
      name: editing.name.trim(),
      modules: moduleText.split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
    };
    updateData((current) => ({
      ...current,
      colleagues: current.colleagues.some((item) => item.id === colleague.id)
        ? current.colleagues.map((item) => item.id === colleague.id ? colleague : item)
        : [...current.colleagues, colleague],
    }));
    setEditing(null);
  };

  const remove = (id: string) => {
    updateData((current) => ({
      ...current,
      colleagues: current.colleagues.filter((item) => item.id !== id),
    }));
  };

  return (
    <>
      <PageHeader
        eyebrow="同事管理"
        title="记住每个人舒服的沟通方式。"
        description="这里不是给同事贴标签，而是提醒自己怎么把信息说清楚。"
        action={<button className="button primary" onClick={startCreate}>＋ 新增同事</button>}
      />

      {editing && (
        <section className="panel colleague-form">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{editing.id ? "编辑资料" : "新增同事"}</p>
              <h2>{editing.id ? `更新 ${editing.name}` : "认识一位新搭档"}</h2>
            </div>
            <button className="icon-button" aria-label="关闭表单" onClick={() => setEditing(null)}>×</button>
          </div>
          <div className="form-grid two-columns">
            <label>
              姓名 *
              <input
                placeholder="例如：小林"
                value={editing.name}
                onChange={(event) => setEditing({ ...editing, name: event.target.value })}
              />
            </label>
            <label>
              角色
              <select
                value={editing.role}
                onChange={(event) => setEditing({ ...editing, role: event.target.value as ColleagueRole })}
              >
                {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="span-two">
              负责模块
              <input placeholder="多个模块用顿号分隔" value={moduleText} onChange={(event) => setModuleText(event.target.value)} />
            </label>
            <fieldset className="span-two tag-fieldset">
              <legend>沟通偏好</legend>
              <div className="tag-picker">
                {communicationTags.map((tag) => (
                  <button
                    className={editing.communicationTags.includes(tag) ? "tag active" : "tag"}
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="span-two">
              手动沟通说明
              <textarea
                placeholder="例如：先发文档，再约 15 分钟快速确认"
                value={editing.manualProfile}
                onChange={(event) => setEditing({ ...editing, manualProfile: event.target.value })}
              />
            </label>
            <label className="switch-row span-two">
              <span>
                <strong>使用 AI 生成沟通建议</strong>
                <small>开启后仍会优先参考你写的说明。</small>
              </span>
              <input
                type="checkbox"
                checked={editing.useAiProfile}
                onChange={(event) => setEditing({ ...editing, useAiProfile: event.target.checked })}
              />
            </label>
          </div>
          <div className="button-row form-actions">
            <button className="button ghost" onClick={() => setEditing(null)}>取消</button>
            <button className="button primary" disabled={!editing.name.trim()} onClick={save}>保存同事</button>
          </div>
        </section>
      )}

      <section className="colleague-grid">
        {data.colleagues.map((colleague) => (
          <article className="panel colleague-card" key={colleague.id}>
            <div className="avatar">{colleague.name.slice(0, 1)}</div>
            <div className="colleague-summary">
              <div className="name-row">
                <h2>{colleague.name}</h2>
                <span className={`role-badge ${colleague.role}`}>{roleLabels[colleague.role]}</span>
              </div>
              <p>{colleague.modules.length ? colleague.modules.join(" · ") : "暂未填写负责模块"}</p>
            </div>
            <div className="chip-list compact">
              {colleague.communicationTags.map((tag) => <span className="tag static" key={tag}>{tag}</span>)}
            </div>
            {colleague.manualProfile && <p className="profile-note">“{colleague.manualProfile}”</p>}
            <div className="card-actions">
              <button onClick={() => startEdit(colleague)}>编辑</button>
              <button className="danger-link" onClick={() => remove(colleague.id)}>删除</button>
            </div>
          </article>
        ))}
        {!data.colleagues.length && !editing && (
          <button className="panel empty-colleagues" onClick={startCreate}>
            <span>＋</span>
            <h2>还没有同事资料</h2>
            <p>先添加一位经常协作的前端或后端同事。</p>
          </button>
        )}
      </section>
    </>
  );
}
