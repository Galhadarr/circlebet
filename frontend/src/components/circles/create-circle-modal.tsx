"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateCircle } from "@/hooks/use-circles";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCircleModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createCircle = useCreateCircle();

  const nameError =
    name.length > 0 && name.length < 3
      ? "Name must be at least 3 characters."
      : name.length > 20
        ? "Name must be 20 characters or fewer."
        : undefined;

  async function handleFileSelected(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    setIconPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const res = await api.upload<{ url: string }>("/uploads/image", file);
      setIconUrl(`${api.baseUrl}${res.url}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Image upload failed.");
      setIconPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  }

  function removeIcon(e: React.MouseEvent) {
    e.stopPropagation();
    setIconUrl(null);
    setIconPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nameError) return;
    createCircle.mutate(
      { name, description: description || null, icon_url: iconUrl || null },
      {
        onSuccess: () => {
          toast.success("Circle created!");
          setName("");
          setDescription("");
          setIconUrl(null);
          setIconPreview(null);
          onClose();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Circle">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Icon uploader */}
        <div className="flex flex-col items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="relative group">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-border hover:border-blue/50 transition-colors bg-bg-tertiary flex items-center justify-center"
            >
              {iconPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconPreview} alt="Circle icon preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-7 h-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M6.75 6.75h.008v.008H6.75V6.75z" />
                </svg>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                  <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              )}
              {!uploading && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
              )}
            </button>
            {iconPreview && !uploading && (
              <button
                type="button"
                onClick={removeIcon}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red rounded-full flex items-center justify-center shadow-sm"
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-xs text-text-muted">Circle icon (optional)</p>
        </div>

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
          disabled={!!nameError || name.length < 3 || uploading}
        >
          Create Circle
        </Button>
      </form>
    </Modal>
  );
}
