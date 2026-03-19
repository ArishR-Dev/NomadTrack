export function LoaderSkeleton({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="h-44 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="stat-card animate-pulse">
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-7 bg-muted rounded w-1/3" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    </div>
  );
}
