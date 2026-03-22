"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

const leaderboard = [
  { rank: 1, name: "WhiteFox", score: 8, medal: "🥇" },
  { rank: 2, name: "SilverBird", score: 5, medal: "🥈" },
  { rank: 3, name: "PurpleDragon", score: 3, medal: "🥉" },
];

function MockLeaderboardCard() {
  return (
    <div className="w-44 bg-surface border border-border rounded-2xl shadow-xl p-3 space-y-2">
      <p className="text-xs font-semibold text-text-primary">Scoreboard</p>
      {leaderboard.map((entry) => (
        <div key={entry.rank} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span>{entry.medal}</span>
            <span className="text-text-secondary">{entry.name}</span>
          </div>
          <span className="font-mono font-medium text-text-primary">{entry.score} pts</span>
        </div>
      ))}
    </div>
  );
}

function MockBetCard() {
  return (
    <div className="w-full max-w-sm bg-surface border border-border rounded-2xl overflow-hidden shadow-lg">
      <div className="h-24 bg-gradient-to-br from-blue/25 via-purple/20 to-green/15" />
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-green-dim text-green">ACTIVE</span>
          <span className="text-xs text-text-muted">6 players</span>
        </div>
        <h3 className="font-semibold text-text-primary leading-snug">
          מתי תהיה האזעקה הבאה?
        </h3>
        <div className="space-y-2">
          {["לפני 2 בלילה", "בין 2-5 בלילה", "אחרי 5 בלילה"].map((label, i) => (
            <div
              key={label}
              className="flex justify-between rounded-xl border border-border px-3 py-2 text-sm"
            >
              <span>{label}</span>
              <span className="text-text-muted font-mono">{[3, 2, 1][i]} picks</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted text-center">Win +1 pt · lose −1 · double down for ±2</p>
      </div>
    </div>
  );
}

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Private Circles",
    desc: "Invite your friends to a private group. Bets and scores stay inside each circle.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    title: "Create bets",
    desc: "Write the question, add 2–5 options, and invite your circle to bet on it.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    title: "Pick & double down",
    desc: "Join active bets, choose an outcome, and optionally double down so wins and losses count double on the scoreboard.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
      </svg>
    ),
    title: "Climb the scoreboard",
    desc: "Every circle has its own leaderboard — medals for the top three, pure bragging rights.",
  },
];

const steps = [
  {
    num: "01",
    title: "Create a Circle",
    desc: "Start a private group and invite your friends with a simple link.",
  },
  {
    num: "02",
    title: "Drop a bet",
    desc: "Multi-option question, optional time limit, you pick your side first.",
  },
  {
    num: "03",
    title: "Friends join in",
    desc: "Once someone else enters, the bet goes live. Creator resolves when it’s time.",
  },
];

export default function LandingPage() {
  const token = useAuthStore((s) => s.token);

  return (
    <div className="min-h-screen overflow-hidden pb-16 sm:pb-0">
      {/* Background pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Nav */}
      <Header />

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up" style={{ "--delay": "0s" } as React.CSSProperties}>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Bet on What You{" "}
              <span className="bg-gradient-to-r from-green to-blue bg-clip-text text-transparent">
                Believe
              </span>
            </h1>
            <p className="text-lg text-text-secondary mb-8 max-w-md leading-relaxed">
              Private circles, multi-option bets, and a scoreboard that updates with every
              win and loss.
            </p>
            <div className="flex gap-4">
              {token ? (
                <Link
                  href="/circles"
                  className="px-7 py-3.5 bg-blue text-white rounded-xl font-semibold hover:opacity-90 transition shadow-lg shadow-blue/20"
                >
                  Go to Circles
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="px-7 py-3.5 bg-blue text-white rounded-xl font-semibold hover:opacity-90 transition shadow-lg shadow-blue/20"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/login"
                    className="px-7 py-3.5 bg-bg-tertiary border border-border rounded-xl font-semibold hover:bg-bg-hover transition"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
          <div
            className="flex justify-center animate-fade-in-up"
            style={{ "--delay": "0.15s" } as React.CSSProperties}
          >
            <div className="relative">
              <MockBetCard />
              <div className="absolute -top-4 -right-10 rotate-2">
                <MockLeaderboardCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h2
          className="text-3xl font-bold text-center mb-4 animate-fade-in-up"
          style={{ "--delay": "0.2s" } as React.CSSProperties}
        >
          Lets see who can predict the future the most times
        </h2>
        <p
          className="text-text-secondary text-center mb-12 max-w-lg mx-auto animate-fade-in-up"
          style={{ "--delay": "0.25s" } as React.CSSProperties}
        >
          Built for friend groups who love hot takes and cold hard scores.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="bg-surface border border-border rounded-2xl p-6 hover:border-blue/30 transition animate-fade-in-up"
              style={{ "--delay": `${0.3 + i * 0.08}s` } as React.CSSProperties}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-dim flex items-center justify-center text-blue mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <h2
          className="text-3xl font-bold text-center mb-12 animate-fade-in-up"
          style={{ "--delay": "0.5s" } as React.CSSProperties}
        >
          How It Works
        </h2>
        <div className="space-y-0">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="relative flex gap-6 animate-fade-in-up"
              style={{ "--delay": `${0.55 + i * 0.1}s` } as React.CSSProperties}
            >
              {/* Connecting line */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-dim border-2 border-blue flex items-center justify-center font-mono font-bold text-blue text-sm shrink-0">
                  {s.num}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-border my-1" />
                )}
              </div>
              <div className="pb-10">
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-text-secondary leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center animate-fade-in-up"
        style={{ "--delay": "0.85s" } as React.CSSProperties}
      >
        <div className="bg-surface border border-border rounded-3xl p-12 md:p-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to put your{" "}
            <span className="text-green">predictions</span>{" "}
            where your mouth is?
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Join CircleBet and run bets on the things that matter to you and your friends.
          </p>
          <Link
            href={token ? "/circles" : "/register"}
            className="inline-block px-8 py-4 bg-blue text-white rounded-xl font-semibold text-lg hover:opacity-90 transition shadow-lg shadow-blue/20"
          >
            {token ? "Go to Circles" : "Create Your Account"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-xs text-text-muted">
        &copy; {new Date().getFullYear()} CircleBet
      </footer>

      <BottomNav />
    </div>
  );
}
