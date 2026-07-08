import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flipchart to Workflow",
  description: "Photograph a flipchart process map, get an editable Excel or Visio workflow file.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
