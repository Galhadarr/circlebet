"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/ui/user-avatar";

const navTabs = [
  { href: "/", label: "Home", exact: true, public: true },
  { href: "/circles", label: "Circles" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/docs", label: "Docs" },
];

export function Header() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!token;

  return (
    <header className="relative z-20 border-b border-border bg-bg-primary/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
        >
          <Image src="/icon.svg" alt="CircleBet" width={24} height={24} />
          <span className="text-xl font-bold tracking-tight">CircleBet</span>
        </Link>

        {/* Center nav tabs — hidden on mobile (bottom-nav handles it) */}
        <nav className="hidden sm:flex items-center gap-1">
          {navTabs.map(({ href, label, exact, public: isPublic }) => {
            const isActive = exact ? pathname === href : pathname?.startsWith(href);

            if (!isAuthenticated && !isPublic) {
              return (
                <Link
                  key={href}
                  href={`/login?redirect=${encodeURIComponent(href)}`}
                  className="relative px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition rounded-lg hover:bg-bg-tertiary"
                >
                  {label}
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 text-sm font-medium transition rounded-lg ${
                  isActive
                    ? "text-blue"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <>
              {user?.display_name && (
                <div className="hidden sm:flex items-center gap-2">
                  <UserAvatar name={user.display_name} />
                  <span className="text-sm text-text-secondary">{user.display_name}</span>
                </div>
              )}
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
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link
                href="/login"
                className="text-sm text-text-secondary hover:text-text-primary transition font-medium"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue text-white rounded-lg text-sm font-semibold hover:opacity-90 transition shadow-sm shadow-blue/20"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
