import { useEffect } from 'react';

import { cn } from '@/lib/utils';
import { CHAPTERS } from '@/constants/tutorial';
import { useTutorialStore } from '@/store/useTutorialStore';

import { Chapter1 } from './Chapter1';
import { Chapter2 } from './Chapter2';
import { Chapter3 } from './Chapter3';
import { Chapter4 } from './Chapter4';
import { Chapter5 } from './Chapter5';

import type { ChapterId } from '@/store/useTutorialStore';

const CHAPTER_COMPONENTS: Record<ChapterId, () => React.JSX.Element> = {
  1: Chapter1,
  2: Chapter2,
  3: Chapter3,
  4: Chapter4,
  5: Chapter5,
};

/** 教程左侧面板:章节导航 + 当前章讲解与控件。 */
export function TutorialPanel() {
  const chapterId = useTutorialStore((s) => s.chapterId);
  const setChapter = useTutorialStore((s) => s.setChapter);

  // 进入某章时,自动开启该章最相关的可视化(用户之后仍可手动调整)。
  useEffect(() => {
    const s = useTutorialStore.getState();
    s.setShowWeights(chapterId === 3);
    s.setShowWorldAxes(chapterId === 4);
    s.setShowBoneAxes(chapterId === 1 || chapterId === 4);
    if (chapterId !== 4) s.setMeshOffset([0, 0, 0]);
  }, [chapterId]);

  const ChapterContent = CHAPTER_COMPONENTS[chapterId];
  const current = CHAPTERS.find((c) => c.id === chapterId)!;

  const prev = chapterId > 1 ? ((chapterId - 1) as ChapterId) : null;
  const next = chapterId < 5 ? ((chapterId + 1) as ChapterId) : null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* 标题 */}
      <div className="pointer-events-auto absolute left-4 top-4 max-w-xs">
        <h1 className="text-sm font-bold text-white drop-shadow-md">3D 角色动画 · 交互教程</h1>
        <p className="text-[11px] text-white/50 drop-shadow-md">骨骼蒙皮原理 by SkinnedMesh</p>
      </div>

      {/* 左侧主面板 */}
      <div
        className={cn(
          'pointer-events-auto absolute bottom-4 left-4 top-16 flex w-[340px] flex-col',
          'rounded-lg border border-white/10 bg-black/70 backdrop-blur-md',
        )}
      >
        {/* 章节标签导航 */}
        <div className="flex shrink-0 gap-1 border-b border-white/10 p-2">
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setChapter(c.id)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded text-xs font-semibold transition-colors',
                c.id === chapterId
                  ? 'bg-sky-500 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80',
              )}
              title={c.title}
            >
              {c.id}
            </button>
          ))}
        </div>

        {/* 当前章标题 */}
        <div className="shrink-0 px-4 pb-1 pt-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-sky-400">
            第 {chapterId} 章
          </div>
          <div className="text-base font-bold text-white">{current.title}</div>
          <div className="text-[11px] text-white/50">{current.subtitle}</div>
        </div>

        {/* 滚动内容区 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
          <ChapterContent />
        </div>

        {/* 上一章 / 下一章 */}
        <div className="flex shrink-0 gap-2 border-t border-white/10 p-2">
          <button
            disabled={!prev}
            onClick={() => prev && setChapter(prev)}
            className="flex-1 rounded bg-white/5 py-1.5 text-xs text-white/70 enabled:hover:bg-white/10 disabled:opacity-30"
          >
            ← 上一章
          </button>
          <button
            disabled={!next}
            onClick={() => next && setChapter(next)}
            className="flex-1 rounded bg-white/5 py-1.5 text-xs text-white/70 enabled:hover:bg-white/10 disabled:opacity-30"
          >
            下一章 →
          </button>
        </div>
      </div>
    </div>
  );
}
