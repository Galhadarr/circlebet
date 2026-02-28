"use client";

import { useState, useRef, useEffect } from "react";

export function InviteLink({ inviteToken }: { inviteToken: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteToken}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1500);
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-bg-tertiary border border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover hover:border-blue/30 transition-all duration-150 active:scale-95"
      >
        {/* Add person icon */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
        Invite Members
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-44 bg-bg-secondary border border-border rounded-xl shadow-lg shadow-black/20 z-30 overflow-hidden animate-fade-in-dropdown">
          <button
            onClick={copy}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            {copied ? (
              <>
                {/* Check icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-green font-medium">Copied!</span>
              </>
            ) : (
              <>
                {/* Link icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Copy link
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
