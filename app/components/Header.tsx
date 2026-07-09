"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function Header({ userEmail }: { userEmail: string | null }) {
  const router = useRouter();

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!userEmail) return null;

  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2.5 text-sm">
        <Link href="/" className="font-semibold text-neutral-700">
          Flipchart to Workflow
        </Link>
        <div className="flex items-center gap-3 text-neutral-500">
          <span>{userEmail}</span>
          <button onClick={onSignOut} className="font-medium text-neutral-700 hover:underline">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
