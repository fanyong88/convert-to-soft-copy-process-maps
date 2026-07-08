import type { MapStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: MapStatus }) {
  const styles =
    status === "reviewed"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : "bg-amber-50 text-amber-700 ring-amber-600/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles}`}
    >
      {status === "reviewed" ? "Reviewed" : "Draft"}
    </span>
  );
}
