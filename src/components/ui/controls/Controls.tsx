import { cn } from '@/lib/utils';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  accent?: string;
}

/** 带标签与数值显示的滑块。 */
export function Slider({ label, value, min, max, step = 1, unit = '', onChange, accent }: SliderProps) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-white/80">{label}</span>
        <span className="font-mono text-xs text-white/60" style={accent ? { color: accent } : undefined}>
          {value.toFixed(step < 1 ? 2 : 0)}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-sky-400"
      />
    </label>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** 开关行。 */
export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between py-1 text-left"
    >
      <span className="text-xs font-medium text-white/80">{label}</span>
      <span
        className={cn(
          'relative h-4 w-7 rounded-full transition-colors',
          checked ? 'bg-sky-500' : 'bg-white/20',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform',
            checked ? 'translate-x-3.5' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  );
}

interface SegmentedOption<T> {
  label: string;
  value: T;
  color?: string;
}

interface SegmentedProps<T extends string | number | null> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** 分段按钮组(单选)。 */
export function Segmented<T extends string | number | null>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className="flex gap-1 rounded-md bg-white/5 p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded px-2 py-1 text-xs font-medium transition-colors',
              active ? 'bg-white/90 text-black' : 'text-white/60 hover:text-white/90',
            )}
            style={active && opt.color ? { backgroundColor: opt.color, color: '#000' } : undefined}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
