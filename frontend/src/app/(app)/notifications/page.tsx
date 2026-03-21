"use client";

import Link from "next/link";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const { data: items, isLoading } = useNotifications(100, 0);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          type="button"
          className="text-sm text-blue hover:underline"
          onClick={() =>
            markAll.mutate(undefined, { onSuccess: () => toast.success("All marked read") })
          }
        >
          Mark all read
        </button>
      </div>
      {!items?.length ? (
        <p className="text-text-secondary text-center py-12">You&apos;re all caught up.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              {n.bet_id && n.circle_id ? (
                <Link
                  href={`/circle/${n.circle_id}/bet/${n.bet_id}`}
                  className={`block rounded-xl border p-4 transition hover:bg-bg-tertiary ${
                    !n.is_read ? "border-blue/30 bg-blue/5" : "border-border"
                  }`}
                  onClick={() => {
                    if (!n.is_read) markRead.mutate(n.id);
                  }}
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-text-secondary mt-1">{n.message}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </Link>
              ) : (
                <div
                  className={`rounded-xl border p-4 ${
                    !n.is_read ? "border-blue/30 bg-blue/5" : "border-border"
                  }`}
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-text-secondary mt-1">{n.message}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
