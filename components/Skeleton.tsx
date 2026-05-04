const widths = ['60%', '75%', '90%', '68%', '85%', '72%', '95%', '63%', '80%', '70%', '88%', '65%', '78%', '92%'];

export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/5 ${className}`}
      style={style}
    />
  );
}

export function PromptCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-1">
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className="h-4 w-10 rounded-full" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  );
}

export function ResultSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-6 rounded-xl border border-white/10 bg-white/5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}
