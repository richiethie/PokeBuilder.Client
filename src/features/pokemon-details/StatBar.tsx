import type { StatEntry } from "@/types";

interface StatBarProps {
  stat: StatEntry;
}

export function StatBar({ stat }: StatBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-right text-[11px] font-medium text-muted-foreground">
        {stat.label}
      </span>
      <span className="w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums">
        {stat.value}
      </span>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.round(stat.fill * 100)}%`,
            backgroundColor: stat.color,
          }}
        />
      </div>
    </div>
  );
}
