import type { ChapterId } from '@/store/useTutorialStore';

export interface ChapterMeta {
  id: ChapterId;
  title: string;
  subtitle: string;
}

/** 教程章节导航元数据(讲解正文写在 ChapterContent 中)。 */
export const CHAPTERS: ChapterMeta[] = [
  { id: 1, title: '骨架与层级', subtitle: 'Bone 是带父子关系的 transform' },
  { id: 2, title: 'Rest / Bind Pose', subtitle: '绑定那一刻被记录了什么' },
  { id: 3, title: '蒙皮原理 (LBS)', subtitle: 'skinWeight 如何让顶点跟随骨骼' },
  { id: 4, title: '空间转换', subtitle: 'world / mesh / bone / local' },
  { id: 5, title: '速查总览', subtitle: '公式与 Three.js API' },
];
