import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';

/** 段落标题。 */
export function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-1.5 text-sm font-semibold text-white">{children}</h3>;
}

/** 普通讲解段落。 */
export function P({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs leading-relaxed text-white/70">{children}</p>;
}

/** 行内强调(关键术语)。 */
export function Term({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span className="font-medium text-white" style={color ? { color } : undefined}>
      {children}
    </span>
  );
}

/** 行内等宽代码 / 公式片段。 */
export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[11px] text-sky-200">
      {children}
    </code>
  );
}

/** 块级公式展示。 */
export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="my-2 overflow-x-auto rounded-md border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-sky-100">
      {children}
    </div>
  );
}

type CalloutTone = 'info' | 'warn' | 'key';

const TONE_STYLES: Record<CalloutTone, string> = {
  info: 'border-sky-400/30 bg-sky-400/10',
  warn: 'border-amber-400/30 bg-amber-400/10',
  key: 'border-violet-400/30 bg-violet-400/10',
};

const TONE_LABEL: Record<CalloutTone, string> = {
  info: '💡 提示',
  warn: '⚠️ 注意',
  key: '🔑 关键',
};

/** 高亮提示框:info / warn / key 三种语气。 */
export function Callout({ tone = 'info', children }: { tone?: CalloutTone; children: ReactNode }) {
  return (
    <div className={cn('my-2 rounded-md border px-3 py-2', TONE_STYLES[tone])}>
      <div className="mb-1 text-[11px] font-semibold text-white/90">{TONE_LABEL[tone]}</div>
      <div className="text-xs leading-relaxed text-white/75">{children}</div>
    </div>
  );
}

/** 控件分组容器。 */
export function ControlGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="my-3 rounded-md border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/50">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
