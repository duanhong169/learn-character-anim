import { create } from 'zustand';

import type { Tuple3 } from '@/types/common';

/** 教程章节标识。 */
export type ChapterId = 1 | 2 | 3 | 4 | 5;

/** 绑定姿态来源:rest = 默认静止姿态;posed = 当前弯曲姿态。 */
export type BindMode = 'rest' | 'posed';

interface TutorialState {
  // ── 章节 ──
  chapterId: ChapterId;
  setChapter: (id: ChapterId) => void;

  // ── 骨骼旋转(各关节绕 Z 轴弯曲,单位:度,跨章节共享) ──
  shoulderDeg: number;
  elbowDeg: number;
  wristDeg: number;
  setShoulderDeg: (deg: number) => void;
  setElbowDeg: (deg: number) => void;
  setWristDeg: (deg: number) => void;
  resetPose: () => void;

  // ── 通用可视化开关 ──
  showBones: boolean;
  showSkin: boolean;
  wireframe: boolean;
  setShowBones: (v: boolean) => void;
  setShowSkin: (v: boolean) => void;
  setWireframe: (v: boolean) => void;

  // ── Ch2:Bind / Rest Pose ──
  bindMode: BindMode;
  /** 每次自增都会强制 SkinnedMesh 重新绑定(即使 bindMode 未变)。 */
  rebindNonce: number;
  setBindMode: (mode: BindMode) => void;
  rebind: (mode: BindMode) => void;

  // ── Ch3:蒙皮权重 ──
  /** 权重过渡带宽度;0 = 硬绑定(每顶点只受单骨骼影响,会撕裂)。 */
  blendWidth: number;
  /** 是否用顶点色显示权重热力图。 */
  showWeights: boolean;
  /** 高亮单根骨骼权重:null = 显示全部混合色;0/1/2 = 只看该骨骼。 */
  soloBone: number | null;
  setBlendWidth: (w: number) => void;
  setShowWeights: (v: boolean) => void;
  setSoloBone: (b: number | null) => void;

  // ── Ch4:空间转换 ──
  /** 整体平移 mesh(演示 world 变而 local/bone 不变)。 */
  meshOffset: Tuple3;
  /** 被检视顶点的索引(显示其在各空间下的坐标)。 */
  probeVertexId: number;
  showWorldAxes: boolean;
  showBoneAxes: boolean;
  setMeshOffset: (offset: Tuple3) => void;
  setProbeVertexId: (id: number) => void;
  setShowWorldAxes: (v: boolean) => void;
  setShowBoneAxes: (v: boolean) => void;
}

const DEFAULT_POSE = { shoulderDeg: 0, elbowDeg: 0, wristDeg: 0 };

export const useTutorialStore = create<TutorialState>((set) => ({
  chapterId: 1,
  setChapter: (id) => set({ chapterId: id }),

  ...DEFAULT_POSE,
  setShoulderDeg: (deg) => set({ shoulderDeg: deg }),
  setElbowDeg: (deg) => set({ elbowDeg: deg }),
  setWristDeg: (deg) => set({ wristDeg: deg }),
  resetPose: () => set({ ...DEFAULT_POSE }),

  showBones: true,
  showSkin: true,
  wireframe: false,
  setShowBones: (v) => set({ showBones: v }),
  setShowSkin: (v) => set({ showSkin: v }),
  setWireframe: (v) => set({ wireframe: v }),

  bindMode: 'rest',
  rebindNonce: 0,
  setBindMode: (mode) => set((s) => ({ bindMode: mode, rebindNonce: s.rebindNonce + 1 })),
  rebind: (mode) => set((s) => ({ bindMode: mode, rebindNonce: s.rebindNonce + 1 })),

  blendWidth: 0.6,
  showWeights: false,
  soloBone: null,
  setBlendWidth: (w) => set({ blendWidth: w }),
  setShowWeights: (v) => set({ showWeights: v }),
  setSoloBone: (b) => set({ soloBone: b }),

  meshOffset: [0, 0, 0],
  probeVertexId: 0,
  showWorldAxes: true,
  showBoneAxes: true,
  setMeshOffset: (offset) => set({ meshOffset: offset }),
  setProbeVertexId: (id) => set({ probeVertexId: id }),
  setShowWorldAxes: (v) => set({ showWorldAxes: v }),
  setShowBoneAxes: (v) => set({ showBoneAxes: v }),
}));
