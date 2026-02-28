"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InviteLink({ inviteToken }: { inviteToken: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteToken}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 text-xs bg-bg-tertiary px-3 py-2 rounded-lg truncate text-text-secondary font-mono">
        {url}
      </code>
      <Button variant="secondary" size="sm" onClick={copy}>
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}
