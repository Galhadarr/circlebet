"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { useUpdateProfile } from "@/hooks/use-auth";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (user) setDisplayName(user.display_name);
  }, [user]);

  if (!user) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplayName(e.target.value);
    setDirty(e.target.value !== user!.display_name);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty) return;
    try {
      await updateProfile.mutateAsync({ display_name: displayName });
      toast.success("Profile updated!");
      setDirty(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-8 animate-fade-in-up">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.display_name} size="lg" />
          <div>
            <p className="font-semibold text-lg">{user.display_name}</p>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary" htmlFor="display-name">
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={handleChange}
              minLength={3}
              maxLength={15}
              className="w-full rounded-xl border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue/40"
            />
            <p className="text-xs text-text-muted">3–15 characters</p>
          </div>

          <Button
            type="submit"
            disabled={!dirty || updateProfile.isPending}
            className="w-full"
          >
            {updateProfile.isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 space-y-2">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Account</h2>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Email</span>
          <span className="text-text-primary">{user.email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Member since</span>
          <span className="text-text-primary">
            {new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
}
