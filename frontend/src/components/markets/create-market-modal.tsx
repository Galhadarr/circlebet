"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateMarket } from "@/hooks/use-markets";
import { api } from "@/lib/api";
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMarket = useCreateMarket();

  async function handleFileSelected(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const res = await api.upload<{ url: string }>("/uploads/image", file);
      setImageUrl(res.url);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Image upload failed.");
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  }

  function removeImage() {
    setImageUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const titleError =
    title.length > 0 && title.length < 5
      ? "Question must be at least 5 characters."
      : title.length > 50
        ? "Question must be 50 characters or fewer."
        : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (titleError) return;
    createMarket.mutate(
      {
        circle_id: circleId,
        title,
        description: description || null,
        image_url: imageUrl || null,
        end_date: new Date(endDate).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Market created!");
          setTitle("");
          setDescription("");
          setEndDate("");
          setImageUrl(null);
          setImagePreview(null);
          onClose();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Market">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Input
            label="Question"
            placeholder="Will X happen by Y date?"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 50))}
            error={titleError}
            required
          />
          <p className={`text-xs text-right tabular-nums ${title.length >= 50 ? "text-red" : "text-text-muted"}`}>
            {title.length}/50
          </p>
        </div>
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

        {/* Image uploader */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">
            Image (optional)
          </label>

          {imagePreview ? (
            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-bg-primary/70 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-blue border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!uploading && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-7 h-7 bg-bg-primary/80 hover:bg-bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors ${
                dragging
                  ? "border-blue bg-blue/5"
                  : "border-border hover:border-blue/50 hover:bg-bg-secondary"
              }`}
            >
              <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-xs text-text-muted">
                Click or drag &amp; drop an image
              </span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={createMarket.isPending}
          disabled={uploading || !!titleError || title.length < 5}
        >
          Create Market
        </Button>
      </form>
    </Modal>
  );
}
