import { isTauri } from "@tauri-apps/api/core";
import { emitTo } from "@tauri-apps/api/event";
import type { ChangeEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import type { AppData, DesktopPetAssetState, DesktopPetDesign } from "../types";

interface PetDesignPageProps {
  data: AppData;
  updateData: (updater: (current: AppData) => AppData) => void;
}

const assetStates: Array<{ key: DesktopPetAssetState; label: string; hint: string }> = [
  { key: "working", label: "工作图", hint: "平时安静陪你工作时显示" },
  { key: "walking", label: "巡逻图", hint: "小兽在屏幕上移动时显示" },
  { key: "dragging", label: "抱起图", hint: "你拖动浮窗时显示" },
  { key: "sleeping", label: "待机图", hint: "预留给后续睡觉/暂停状态" },
];

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `pet-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function notifyPetDesignChanged(): Promise<void> {
  if (!isTauri()) return;
  await emitTo("pet", "pushpet://pet-design-updated", {});
}

export function PetDesignPage({ data, updateData }: PetDesignPageProps) {
  const selectedPetId = data.config.selectedDesktopPetId;
  const selectedPet = data.desktopPets.find((pet) => pet.id === selectedPetId) ?? data.desktopPets[0];

  const createPet = () => {
    const now = new Date().toISOString();
    const pet: DesktopPetDesign = {
      id: createId(),
      name: `我的桌宠 ${data.desktopPets.length + 1}`,
      description: "上传透明 PNG / WebP 后，小兽浮窗会使用这套状态图。",
      assets: {},
      createdAt: now,
      updatedAt: now,
    };

    updateData((current) => ({
      ...current,
      desktopPets: [...current.desktopPets, pet],
      config: { ...current.config, selectedDesktopPetId: pet.id },
    }));
    void notifyPetDesignChanged();
  };

  const updatePet = (petId: string, patch: Partial<DesktopPetDesign>) => {
    updateData((current) => ({
      ...current,
      desktopPets: current.desktopPets.map((pet) => pet.id === petId
        ? { ...pet, ...patch, updatedAt: new Date().toISOString() }
        : pet),
    }));
    void notifyPetDesignChanged();
  };

  const selectPet = (petId: string) => {
    updateData((current) => ({
      ...current,
      config: { ...current.config, selectedDesktopPetId: petId },
    }));
    void notifyPetDesignChanged();
  };

  const deletePet = (petId: string) => {
    if (data.desktopPets.length <= 1) return;
    updateData((current) => {
      const nextPets = current.desktopPets.filter((pet) => pet.id !== petId);
      const nextSelected = current.config.selectedDesktopPetId === petId
        ? nextPets[0]?.id ?? current.config.selectedDesktopPetId
        : current.config.selectedDesktopPetId;

      return {
        ...current,
        desktopPets: nextPets,
        config: { ...current.config, selectedDesktopPetId: nextSelected },
      };
    });
    void notifyPetDesignChanged();
  };

  const uploadAsset = async (petId: string, state: DesktopPetAssetState, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const dataUrl = await readFileAsDataUrl(file);
    updateData((current) => ({
      ...current,
      desktopPets: current.desktopPets.map((pet) => pet.id === petId
        ? {
            ...pet,
            assets: { ...pet.assets, [state]: dataUrl },
            updatedAt: new Date().toISOString(),
          }
        : pet),
    }));
    void notifyPetDesignChanged();
  };

  const clearAsset = (petId: string, state: DesktopPetAssetState) => {
    updateData((current) => ({
      ...current,
      desktopPets: current.desktopPets.map((pet) => {
        if (pet.id !== petId) return pet;
        const nextAssets = { ...pet.assets };
        delete nextAssets[state];
        return { ...pet, assets: nextAssets, updatedAt: new Date().toISOString() };
      }),
    }));
    void notifyPetDesignChanged();
  };

  return (
    <>
      <PageHeader
        eyebrow="桌宠设计"
        title="把小夜换成你的桌宠"
        description="可以创建多套桌宠，并给每个状态上传透明 PNG / WebP。当前选中的桌宠会同步到桌面浮窗。"
        action={<button className="button primary" onClick={createPet}>新建桌宠</button>}
      />

      <section className="pet-design-layout">
        <aside className="panel pet-design-list">
          <div className="section-heading">
            <span>01</span>
            <div>
              <h2>桌宠列表</h2>
              <p>切换不同小兽方案。</p>
            </div>
          </div>
          <div className="pet-design-items">
            {data.desktopPets.map((pet) => (
              <button
                className={pet.id === selectedPetId ? "pet-design-item active" : "pet-design-item"}
                key={pet.id}
                onClick={() => selectPet(pet.id)}
              >
                <span className="pet-design-thumb">
                  {pet.assets.working ? <img src={pet.assets.working} alt="" /> : "?"}
                </span>
                <span>
                  <strong>{pet.name}</strong>
                  <small>{pet.id === selectedPetId ? "当前使用中" : "点击切换"}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <article className="panel pet-design-editor">
          {selectedPet ? (
            <>
              <div className="pet-design-editor-head">
                <div>
                  <p className="eyebrow">当前桌宠</p>
                  <h2>{selectedPet.name}</h2>
                </div>
                <div className="button-row">
                  <button className="button secondary" onClick={() => selectPet(selectedPet.id)}>设为当前</button>
                  <button
                    className="button ghost"
                    disabled={data.desktopPets.length <= 1}
                    onClick={() => deletePet(selectedPet.id)}
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="form-grid two-columns pet-meta-grid">
                <label>
                  桌宠名称
                  <input
                    value={selectedPet.name}
                    onChange={(event) => updatePet(selectedPet.id, { name: event.target.value })}
                  />
                </label>
                <label>
                  备注
                  <input
                    value={selectedPet.description ?? ""}
                    onChange={(event) => updatePet(selectedPet.id, { description: event.target.value })}
                    placeholder="例如：冰龙、猫猫、工作搭子"
                  />
                </label>
              </div>

              <div className="asset-state-grid">
                {assetStates.map((state) => {
                  const asset = selectedPet.assets[state.key];
                  return (
                    <section className="asset-state-card" key={state.key}>
                      <div className="asset-preview">
                        {asset ? <img src={asset} alt={state.label} /> : <span>未上传</span>}
                      </div>
                      <div>
                        <h3>{state.label}</h3>
                        <p>{state.hint}</p>
                        <div className="button-row">
                          <label className="button secondary upload-button">
                            上传图片
                            <input
                              accept="image/png,image/webp"
                              type="file"
                              onChange={(event) => void uploadAsset(selectedPet.id, state.key, event)}
                            />
                          </label>
                          {asset ? (
                            <button className="button ghost" onClick={() => clearAsset(selectedPet.id, state.key)}>
                              清除
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            </>
          ) : (
            <section className="empty-page">
              <span>暂无桌宠</span>
              <h2>先新建一个桌宠方案。</h2>
              <button className="button primary" onClick={createPet}>新建桌宠</button>
            </section>
          )}
        </article>
      </section>
    </>
  );
}
