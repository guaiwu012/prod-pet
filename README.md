# PushPet / 需求小兽

macOS 桌面需求推进小宠物。当前已完成 MVP 第 4 轮：

- 今日任务 Dashboard、桌宠提醒和今日完成状态
- 需求周期、工作日、假期与提醒时间配置
- 同事资料新增、编辑、删除和沟通偏好标签
- 基于任务、需求周、角色和沟通偏好的本地话术生成
- 沟通记录新增、编辑、删除、按需求/同事筛选
- 从本周沟通记录生成中文周报草稿
- DeepSeek 设置页与请求失败/未配置时的本地规则回退
- 健康提醒页：喝水、站立、稍后提醒、提醒间隔和调皮模式
- Dashboard 健康小兽卡片：同步展示今日健康计数与提醒状态
- Tauri 桌宠窗口桥接：桌面端可切换置顶与隐藏任务栏入口
- Tauri 独立桌宠小窗：启动桌面端时自动显示置顶小兽浮窗
- 桌宠素材状态：工作时显示工作图，拖动时显示抱起图，乱走时显示运动图；默认静止不闪烁
- 桌宠交互：初始位于屏幕右下角，左键拖动并记住位置，右键隐藏，主窗口可随时显示/隐藏并开关乱走
- 桌宠权限：已授权读取鼠标位置、读取/设置窗口位置和原生窗口拖拽
- 渐进式披露：桌宠页默认只展示显示/隐藏与乱走，高级健康提醒折叠收纳
- 所有已实现数据均使用 localStorage 本地保存

## Web 模式

```bash
npm install
npm run dev
```

打开 `http://localhost:1420`。

## 构建

```bash
npm run build
```

## Tauri 桌面模式

当前环境已补齐：

- Xcode Command Line Tools: `/Library/Developer/CommandLineTools`
- Rust: `rustc 1.96.0`
- Cargo: `cargo 1.96.0`
- macOS target: `aarch64-apple-darwin`

开发运行：

```bash
npm run tauri dev
```

打包：

```bash
npm run tauri -- build
```

已成功生成：

- `src-tauri/target/release/bundle/macos/PushPet.app`
- `src-tauri/target/release/bundle/dmg/PushPet_0.1.0_aarch64.dmg`

桌面端启动后会创建两个窗口：

- `PushPet / 需求小兽`：主应用窗口
- `需求小兽`：无边框、置顶、跳过任务栏的小兽浮窗

桌宠浮窗交互：

- 左键拖动小兽
- 右键隐藏小兽
- 在主窗口「健康提醒」页可显示/隐藏浮窗、开启/关闭乱走
- 默认出现在屏幕右下角，尺寸为 90×110
- 小夜自动巡逻频率较低，约 45 秒一次，移动速度较慢

## 下一轮

系统通知、菜单栏/托盘入口、真实桌宠小窗形态，以及更完整的 AI 润色体验。
