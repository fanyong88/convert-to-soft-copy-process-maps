import { randomUUID } from "crypto";
import type { ProcessStep, StepType } from "@/lib/types";

const SHAPE_STYLE: Record<StepType, string> = {
  start: "ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;",
  end: "ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;",
  decision: "rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;",
  task: "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;",
};

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildDrawioXml(steps: ProcessStep[]): string {
  const ordered = steps.slice().sort((a, b) => a.sequence - b.sequence);

  const nodeWidth = 180;
  const nodeHeight = 70;
  const gapY = 100;
  const x = 80;

  const cells: string[] = [];
  const edges: string[] = [];

  ordered.forEach((step, i) => {
    const id = `step-${step.id}`;
    const y = 40 + i * gapY;
    cells.push(
      `<mxCell id="${id}" value="${xmlEscape(step.label)}" style="${SHAPE_STYLE[step.step_type] ?? SHAPE_STYLE.task}" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" as="geometry" /></mxCell>`,
    );
    if (i > 0) {
      const sourceId = `step-${ordered[i - 1].id}`;
      edges.push(
        `<mxCell id="edge-${i}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;" edge="1" parent="1" source="${sourceId}" target="${id}"><mxGeometry relative="1" as="geometry" /></mxCell>`,
      );
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" agent="convert-to-soft-copy-process-maps">
  <diagram id="${randomUUID()}" name="Process Flow">
    <mxGraphModel dx="900" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        ${cells.join("\n        ")}
        ${edges.join("\n        ")}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
}
