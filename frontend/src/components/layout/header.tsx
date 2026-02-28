"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return (
    <header className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0">
      <Link href="/dashboard" className="text-lg font-bold">
        Circle<span className="text-blue">Bet</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary hidden sm:block">
          {user?.display_name}
        </span>
        <ThemeToggle />
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="text-sm text-text-muted hover:text-text-primary transition"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
