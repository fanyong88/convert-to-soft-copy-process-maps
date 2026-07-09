import * as XLSX from "xlsx";
import type { ProcessStep } from "@/lib/types";

export function buildExcelBuffer(steps: ProcessStep[]): Buffer {
  const rows = steps
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map((s) => ({
      Sequence: s.sequence,
      Label: s.label,
      Type: s.step_type,
      Notes: s.notes ?? "",
    }));

  const ws = XLSX.utils.json_to_sheet(rows, {
    header: ["Sequence", "Label", "Type", "Notes"],
  });
  ws["!cols"] = [{ wch: 10 }, { wch: 45 }, { wch: 12 }, { wch: 40 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Steps");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
