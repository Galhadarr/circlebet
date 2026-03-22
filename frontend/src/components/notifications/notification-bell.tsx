"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import toast from "react-hot-toast";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: items } = useNotifications(15, 0);
  const { data: unread } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const count = unread?.count ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition cursor-pointer"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red text-white text-[10px] font-bold">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-border bg-bg-secondary shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm">Inbox</span>
            {count > 0 && (
              <button
                type="button"
                className="text-xs text-blue hover:underline"
                onClick={() => {
                  markAll.mutate(undefined, {
                    onSuccess: () => toast.success("All read"),
                  });
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[min(60vh,320px)] overflow-y-auto">
            {!items?.length ? (
              <p className="px-4 py-8 text-center text-sm text-text-muted">No notifications yet.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-bg-tertiary transition ${
                    !n.is_read ? "bg-blue/5" : ""
                  }`}
                  onClick={() => {
                    if (!n.is_read) markRead.mutate(n.id);
                    if (n.bet_id && n.circle_id) {
                      window.location.href = `/circle/${n.circle_id}/bet/${n.bet_id}`;
                    }
                  }}
                >
                  <p className="text-sm font-medium text-text-primary">{n.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-text-muted mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
          <Link
            href="/notifications"
            className="block text-center py-3 text-sm text-blue hover:bg-bg-tertiary font-medium"
            onClick={() => setOpen(false)}
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
