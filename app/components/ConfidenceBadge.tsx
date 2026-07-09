export function ConfidenceBadge({
  confidence,
  reviewStatus,
}: {
  confidence: number | null;
  reviewStatus: string | null;
}) {
  if (confidence === null) {
    return <span className="text-xs text-neutral-400">manual</span>;
  }

  const pct = Math.round(confidence * 100);

  if (confidence >= 0.85) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {pct}%
      </span>
    );
  }

  if (confidence >= 0.7) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-medium text-amber-700"
        title="Check this step"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {pct}% {reviewStatus === "unreviewed" && "· Check this step"}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium text-red-700"
      title="AI unsure — please verify"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      {pct}% {reviewStatus === "unreviewed" && "· AI unsure, verify"}
    </span>
  );
}
