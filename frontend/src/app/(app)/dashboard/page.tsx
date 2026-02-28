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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Circles</h1>
        <Button onClick={() => setShowCreate(true)}>+ New Circle</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : circles && circles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {circles.map((circle) => (
            <CircleCard key={circle.id} circle={circle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <p className="text-text-secondary">
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
