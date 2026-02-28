"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Circle<span className="text-blue">Bet</span>
        </h1>
        <p className="text-text-secondary text-lg">
          Prediction markets for your circle of friends. Create markets, trade
          on outcomes, and see who has the best forecasting skills.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue rounded-lg font-medium hover:opacity-90 transition"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-bg-tertiary border border-border rounded-lg font-medium hover:bg-bg-hover transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
