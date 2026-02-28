"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useJoinCircle } from "@/hooks/use-circles";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";

export default function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const joinCircle = useJoinCircle();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || !token) return;
    attempted.current = true;

    joinCircle.mutate(token, {
      onSuccess: (circle) => {
        toast.success(`Joined ${circle.name}!`);
        router.replace(`/circle/${circle.id}`);
      },
      onError: (err) => {
        toast.error(err.message);
        router.replace("/dashboard");
      },
    });
  }, [token, joinCircle, router]);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Spinner size="lg" />
      <p className="text-text-secondary">Joining circle...</p>
    </div>
  );
}
