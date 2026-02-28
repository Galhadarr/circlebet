"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateCircle } from "@/hooks/use-circles";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCircleModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createCircle = useCreateCircle();

  const nameError =
    name.length > 0 && name.length < 3
      ? "Name must be at least 3 characters."
      : name.length > 20
        ? "Name must be 20 characters or fewer."
        : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nameError) return;
    createCircle.mutate(
      { name, description: description || null },
      {
        onSuccess: () => {
          toast.success("Circle created!");
          setName("");
          setDescription("");
          onClose();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Circle">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Input
            label="Circle Name"
            placeholder="e.g. Office Bets"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            error={nameError}
            required
          />
          <p className={`text-xs text-right tabular-nums ${name.length >= 20 ? "text-red" : "text-text-muted"}`}>
            {name.length}/20
          </p>
        </div>
        <Input
          label="Description (optional)"
          placeholder="What's this circle about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          type="submit"
          className="w-full"
          loading={createCircle.isPending}
          disabled={!!nameError || name.length < 3}
        >
          Create Circle
        </Button>
      </form>
    </Modal>
  );
}
