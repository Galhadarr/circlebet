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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        <Input
          label="Circle Name"
          placeholder="e.g. Office Bets"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        >
          Create Circle
        </Button>
      </form>
    </Modal>
  );
}
