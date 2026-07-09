import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/app/components/Header";

export const metadata: Metadata = {
  title: "Flipchart to Workflow",
  description: "Photograph a flipchart process map, get an editable Excel or Visio workflow file.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 text-neutral-900">
        <Header userEmail={user?.email ?? null} />
        {children}
      </body>
    </html>
  );
}
