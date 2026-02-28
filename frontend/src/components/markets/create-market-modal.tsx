"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateMarket } from "@/hooks/use-markets";
import toast from "react-hot-toast";

interface Props {
  circleId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMarketModal({ circleId, isOpen, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");
  const createMarket = useCreateMarket();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMarket.mutate(
      {
        circle_id: circleId,
        title,
        description: description || null,
        end_date: new Date(endDate).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Market created!");
          setTitle("");
          setDescription("");
          setEndDate("");
          onClose();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Market">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Question"
          placeholder="Will X happen by Y date?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          label="Description (optional)"
          placeholder="Additional context..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="End Date"
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <Button
          type="submit"
          className="w-full"
          loading={createMarket.isPending}
        >
          Create Market
        </Button>
      </form>
    </Modal>
  );
}
