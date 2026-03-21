"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { NotificationBell } from "@/components/notifications/notification-bell";

const navTabs = [
  {
    href: "/",
    label: "Home",
    exact: true,
    public: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
      </svg>
    ),
  },
  {
    href: "/circles",
    label: "Circles",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    href: "/notifications",
    label: "Inbox",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  },
  {
    href: "/docs",
    label: "Docs",
    public: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
];

export function Header() {
  const token = useAuthStore((s) => s.token);
  const pathname = usePathname();

  const isAuthenticated = !!token;

  return (
    <header className="relative z-20 border-b border-border bg-bg-primary/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0"
        >
          <Image src="/icon.svg" alt="CircleBet" width={40} height={40} />
          <span className="text-2xl font-bold tracking-tight">CircleBet</span>
        </Link>

        {/* Center nav tabs — hidden on mobile (bottom-nav handles it) */}
        <nav className="hidden sm:flex items-center gap-1">
          {navTabs.map(({ href, label, exact, public: isPublic, icon }) => {
            const isActive = exact ? pathname === href : pathname?.startsWith(href);

            if (!isAuthenticated && !isPublic) {
              return (
                <Link
                  key={href}
                  href={`/login?redirect=${encodeURIComponent(href)}`}
                  className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition rounded-lg hover:bg-bg-tertiary"
                >
                  {icon}
                  {label}
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition rounded-lg ${
                  isActive
                    ? "text-blue"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                }`}
              >
                {icon}
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <ProfileDropdown />
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
