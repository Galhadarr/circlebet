"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

function MockMarketCard() {
  const yesPrice = 0.63;
  const noPrice = 0.37;
  const yesPct = Math.round(yesPrice * 100);

  return (
    <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-dim flex items-center justify-center text-sm">
          🏀
        </div>
        <div>
          <p className="text-xs text-text-muted font-mono">Sports &middot; Closes Mar 15</p>
        </div>
      </div>
      <h3 className="font-semibold text-text-primary mb-4 leading-snug">
        Will the Celtics win the NBA Championship?
      </h3>
      {/* Ratio bar */}
      <div className="flex h-2 rounded-full overflow-hidden mb-4">
        <div className="bg-green" style={{ width: `${yesPct}%` }} />
        <div className="bg-red" style={{ width: `${100 - yesPct}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button className="flex flex-col items-center gap-1 py-3 rounded-xl bg-green-dim border border-green/20 hover:border-green/40 transition">
          <span className="text-xs font-mono text-text-muted">YES</span>
          <span className="text-xl font-bold font-mono text-green">
            {yesPrice.toFixed(2)}
          </span>
          <span className="text-xs text-text-muted font-mono">
            {(1 / yesPrice).toFixed(1)}x
          </span>
        </button>
        <button className="flex flex-col items-center gap-1 py-3 rounded-xl bg-red-dim border border-red/20 hover:border-red/40 transition">
          <span className="text-xs font-mono text-text-muted">NO</span>
          <span className="text-xl font-bold font-mono text-red">
            {noPrice.toFixed(2)}
          </span>
          <span className="text-xs text-text-muted font-mono">
            {(1 / noPrice).toFixed(1)}x
          </span>
        </button>
      </div>
      <div className="flex justify-between mt-3 text-xs text-text-muted font-mono">
        <span>Vol: 2,431 shares</span>
        <span>12 traders</span>
      </div>
    </div>
  );
}

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    title: "Create Markets",
    desc: "Ask a question about anything — sports, politics, your friend's love life. Set a deadline and let the market decide.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    title: "Trade Predictions",
    desc: "Buy YES or NO shares. Prices move with demand — buy low, sell high, and cash out when the market resolves.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 12 7s5-3 7.5-3a2.5 2.5 0 0 1 0 5H18" />
        <path d="M18 15h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M6 15H4.5a2.5 2.5 0 0 1 0-5H6" />
        <line x1="6" y1="9" x2="18" y2="9" />
        <line x1="6" y1="15" x2="18" y2="15" />
        <line x1="10" y1="9" x2="8" y2="21" />
        <line x1="14" y1="9" x2="16" y2="21" />
      </svg>
    ),
    title: "Compete on Leaderboards",
    desc: "Track who has the sharpest predictions. Climb the ranks and prove you know what's coming next.",
  },
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
    desc: "Invite your friends to a private group. Keep your markets personal, competitive, and fun.",
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
    title: "Post a Market",
    desc: "Ask a question about the future. Set the stakes and a resolution date.",
  },
  {
    num: "03",
    title: "Trade & Win",
    desc: "Buy shares on outcomes you believe in. Earn when you're right.",
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
              Prediction markets for your circle of friends. Create questions, trade
              on outcomes, and prove who really knows what's going to happen.
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
            <MockMarketCard />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h2
          className="text-3xl font-bold text-center mb-4 animate-fade-in-up"
          style={{ "--delay": "0.2s" } as React.CSSProperties}
        >
          Everything you need to predict the future
        </h2>
        <p
          className="text-text-secondary text-center mb-12 max-w-lg mx-auto animate-fade-in-up"
          style={{ "--delay": "0.25s" } as React.CSSProperties}
        >
          A full prediction market platform, built for friend groups.
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
            Join CircleBet and start trading on the things that matter to you and your friends.
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
