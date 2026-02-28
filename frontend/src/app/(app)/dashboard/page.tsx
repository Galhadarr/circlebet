"use client";

import { useState } from "react";
import { useCircles } from "@/hooks/use-circles";
import { CircleCard } from "@/components/circles/circle-card";
import { CreateCircleModal } from "@/components/circles/create-circle-modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardPage() {
  const { data: circles, isLoading } = useCircles();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in-up" style={{ "--delay": "0s" } as React.CSSProperties}>
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your{" "}
            <span className="bg-gradient-to-r from-blue to-green bg-clip-text text-transparent">
              Circles
            </span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Private prediction markets with your friends
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Circle</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : circles && circles.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {circles.map((circle, i) => (
            <div
              key={circle.id}
              className="animate-fade-in-up"
              style={{ "--delay": `${0.05 + i * 0.06}s` } as React.CSSProperties}
            >
              <CircleCard circle={circle} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-20 bg-surface border border-border rounded-2xl shadow-sm animate-fade-in-up"
          style={{ "--delay": "0.1s" } as React.CSSProperties}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-dim flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-text-secondary mb-4">
            You haven&apos;t joined any circles yet.
          </p>
          <Button onClick={() => setShowCreate(true)}>
            Create Your First Circle
          </Button>
        </div>
      )}

      <CreateCircleModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
