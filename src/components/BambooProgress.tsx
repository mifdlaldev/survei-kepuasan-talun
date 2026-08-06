import { clsx } from "clsx";

/**
 * Signature: progress bar berbentuk ruas bambu.
 * 5 ruas = 5 langkah survei. Ruas terisi = langkah selesai.
 */
interface BambooProgressProps {
  current: number; // 0-based
  total: number;
  label: string;
}

export function BambooProgress({ current, total, label }: BambooProgressProps) {
  const segments = Array.from({ length: total }, (_, i) => i <= current);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-pine-600">
          {label}
        </span>
        <span className="text-sm font-bold tabular-nums text-charcoal-900">
          {current + 1}
          <span className="text-charcoal-700/50"> / {total}</span>
        </span>
      </div>
      <div className="flex h-3 gap-1.5" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
        {segments.map((filled, i) => (
          <div
            key={i}
            className={clsx(
              "h-full flex-1 rounded-full transition-colors duration-500",
              filled
                ? "bg-gradient-to-r from-pine-600 to-padi-400"
                : "bg-sand-200",
            )}
          />
        ))}
      </div>
    </div>
  );
}
