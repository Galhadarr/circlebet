"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { BetCreate } from "@/lib/types";
import { useCreateBet } from "@/hooks/use-bets";

interface Props {
  circleId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBetModal({ circleId, isOpen, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTimeLimited, setIsTimeLimited] = useState(false);
  const [endLocal, setEndLocal] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const createBet = useCreateBet();

  function addOption() {
    if (options.length >= 5) return;
    setOptions([...options, ""]);
  }

  function removeOption(i: number) {
    if (options.length <= 2) return;
    const next = options.filter((_, j) => j !== i);
    setOptions(next);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image.");
      return;
    }
    setUploading(true);
    try {
      const res = await api.upload<{ url: string }>("/uploads/image", file);
      setImageUrl(res.url);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = options.map((o) => o.trim()).filter(Boolean);
    if (cleaned.length < 2) {
      toast.error("Add at least 2 options.");
      return;
    }
    let end_time: string | null = null;
    if (isTimeLimited) {
      if (!endLocal) {
        toast.error("Pick an end time.");
        return;
      }
      end_time = new Date(endLocal).toISOString();
    }
    const payload: BetCreate = {
      circle_id: circleId,
      title: title.trim(),
      description: description.trim() || null,
      image_url: imageUrl,
      is_time_limited: isTimeLimited,
      end_time,
      options: cleaned,
    };
    createBet.mutate(payload, {
      onSuccess: () => {
        toast.success("Bet created!");
        setTitle("");
        setDescription("");
        setImageUrl(null);
        setOptions(["", ""]);
        setIsTimeLimited(false);
        setEndLocal("");
        onClose();
      },
      onError: (err: Error) => toast.error(err.message),
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create bet">
      <form onSubmit={handleSubmit} className="space-y-4 pb-4">
        <div>
          <label className="text-xs text-text-muted">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are we betting on?"
            required
            maxLength={500}
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Description (optional)</label>
          <textarea
            className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm min-h-[72px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Banner image (optional)</label>
          <div className="flex gap-2 items-center mt-1">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading…" : imageUrl ? "Change image" : "Upload"}
            </Button>
            {imageUrl && (
              <Button type="button" variant="secondary" size="sm" onClick={() => setImageUrl(null)}>
                Remove
              </Button>
            )}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isTimeLimited}
            onChange={(e) => setIsTimeLimited(e.target.checked)}
          />
          Time limited (entries close at…)
        </label>
        {isTimeLimited && (
          <Input
            type="datetime-local"
            value={endLocal}
            onChange={(e) => setEndLocal(e.target.value)}
            required={isTimeLimited}
          />
        )}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted">Options (2–5)</span>
            <Button type="button" variant="secondary" size="sm" onClick={addOption} disabled={options.length >= 5}>
              + Option
            </Button>
          </div>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                value={opt}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = e.target.value;
                  setOptions(next);
                }}
                placeholder={`Option ${i + 1}`}
              />
              {options.length > 2 && (
                <Button type="button" variant="secondary" size="sm" onClick={() => removeOption(i)}>
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="submit" className="w-full" disabled={createBet.isPending}>
          Create bet
        </Button>
      </form>
    </Modal>
  );
}
