# Project Instructions

> 交互式 3D 角色动画教学应用：手搓 `SkinnedMesh`，讲解骨骼蒙皮原理（LBS）。
> React Three Fiber + TypeScript + Tailwind v4 + Zustand + Vite。

## Commands

```bash
npm run dev          # Vite 开发服务器（勿自动启动，由用户决定）
npm run build        # tsc -b && vite build
npm run lint         # ESLint，--max-warnings 0（CI 必过）
npm run lint:fix     # 自动修复
npm run type-check   # tsc --noEmit
npm run test         # vitest run（一次性）
npm run test:watch   # vitest watch
npm run format       # prettier 写入
```

## 这个项目在做什么

左侧 5 章教程面板（HTML overlay）+ 右侧实时 3D 演示（Canvas），讲解骨骼蒙皮：

| 章 | 主题 | 核心交互 |
|----|------|----------|
| 1 | 骨架与层级 | 拖动 3 个关节角度，看 Bone 父子 transform 传递 |
| 2 | Rest / Bind Pose | `rest` vs `posed` 重绑定，看 inverse bind matrix 的影响 |
| 3 | 蒙皮 LBS | `blendWidth` 调过渡带、权重热力图、solo 单骨骼 |
| 4 | 空间转换 | 平移 mesh，看 local/mesh/bone/world 坐标差异 |
| 5 | 速查总览 | 公式与 Three.js API |

核心 3D 对象是一根沿 +Y 的圆柱手臂，由 3 根 Bone（shoulder/elbow/wrist）串联驱动。

## 架构：模块级单例 Rig（最重要，易误改）

`src/utils/skinning.ts` 用 `getArmRig()` 维护**唯一的 SkinnedMesh 装配单例**
（geometry / material / bones / skeleton / mesh）。这是本项目跨 Canvas/UI 边界
共享可变 3D 状态的刻意手法：

- **Canvas 侧**（`SkinnedArm` / `BoneGizmo` / `SpaceAxes`）在 `useFrame` 内
  `getArmRig()` 取用并 mutate 骨骼 —— rig 是稳定单例，**不进依赖数组**。
- **UI 侧**（`MatrixInspector`）读同一份 live 骨骼/矩阵，用低频 `setInterval`
  （~8fps）轮询显示数值 —— **绝不在 useFrame 里 setState**。
- Zustand（`useTutorialStore`）只存标量参数（关节角度、blendWidth、章节等），
  **不存** rig 本身。
- 组件卸载**不 dispose** 单例，重新挂载复用。
- 蒙皮 LBS 在 `getSkinnedVertexWorld()` 里有一份 CPU 等价实现，供面板展示数值。

## 目录结构

```
src/
├── components/
│   ├── canvas/                  # R3F 元素（禁用 DOM）
│   │   ├── TutorialScene/       # 主场景：灯光/环境/控制器 + 一次性装配
│   │   ├── SkinnedArm/          # 手臂 SkinnedMesh，每帧 mutate 骨骼
│   │   ├── BoneGizmo/           # 关节球 + 连线 + local 坐标轴
│   │   └── SpaceAxes/           # world/bone 坐标轴可视化
│   └── ui/                      # HTML/Tailwind overlay（禁用 R3F）
│       ├── TutorialPanel/       # 5 章导航 + Chapter1-5 讲解与控件
│       ├── MatrixInspector/     # 顶点坐标实时面板（轮询，非 useFrame）
│       ├── controls/            # 通用 Slider 等控件
│       └── prose/               # 讲解排版组件（见下）
├── store/useTutorialStore.ts    # 全局教程状态（标量）
├── utils/skinning.ts            # rig 单例、几何/权重/骨架构建、LBS CPU 实现
├── constants/tutorial.ts        # 章节元数据 CHAPTERS
└── App.tsx                      # Canvas + TutorialPanel 组合
```

## Canvas / UI 分离（硬约束）

- `components/canvas/` —— **仅** R3F/Three.js 元素，禁用 `div`/`button` 等 DOM。
- `components/ui/` —— **仅** HTML/Tailwind，overlay 容器 `pointer-events-none`，
  交互元素单独 `pointer-events-auto`。
- 两侧通信走 **Zustand**（标量）或**单例 rig**（live 3D 状态），不跨边界 prop drilling。

## 讲解文本排版

教程讲解用自研 `ui/prose/Prose.tsx`（`<P>` `<SectionTitle>` `<Term>` `<Code>`
`<Formula>` `<Callout tone="info|warn|key">` `<ControlGroup>`），**不是** Markdown 渲染。
本项目无 ReactMarkdown/Shiki，新增讲解段落请复用这些组件，勿引入 Markdown 管线。

## 关键约定（框架通用，从简）

- **命名**：组件 PascalCase（`SkinnedArm.tsx`，named export，函数声明，无 default）；
  hook `useXxx`；store `useXxxStore`；事件处理 `handleXxx`，回调 prop `onXxx`；
  布尔 `is/has/should`；常量 UPPER_SNAKE；位置/旋转/缩放用 `Tuple3`。
- **TypeScript**：`strict` + `noUncheckedIndexedAccess` —— 索引访问是 `T | undefined`，
  必须守卫或 `arr[i]!`。props 用 `interface` 并导出；联合用 `type`；Three.js 类型 `import type`。
- **useFrame**：只 mutate ref/单例，**禁止 setState**；读 store 用 `getState()`（非响应）；
  复用临时对象（module-level `const tmpVec = new THREE.Vector3()`），勿每帧 new。
- **Zustand**：永远用 selector（`useTutorialStore((s) => s.x)`），勿裸调。
- **ESLint react-hooks 7.x**（`--max-warnings 0`）：勿 mutate useState/useMemo 值或 dep 数组中的值；
  勿在 render 期读写 `ref.current`；每帧 mutate 的对象用 module-level const。
- **Tailwind**：仅用于 `components/ui/`，无内联 style，条件类用 `cn()`，玻璃拟态
  `bg-black/60 backdrop-blur-sm border border-white/10`。
- **import 顺序**：React/R3F → 三方库 → `@/` 别名 → 相对路径 → `import type`（各组末尾）。
- **注释**：默认不写；只解释 *why*（非显性权衡、workaround、跨模块不变量），不解释 *what*。
- **Git**：Conventional Commits，subject 祈使态、小写、< 72 字符、无句号；prefix 用英文。

## 默认回复中文（代码注释、commit message 同）；技术术语保留英文。
