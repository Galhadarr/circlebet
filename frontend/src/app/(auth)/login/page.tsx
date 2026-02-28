"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useLogin, useGoogleAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const login = useLogin();
  const googleAuth = useGoogleAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => router.push(redirect) }
    );
  }

  const registerHref = redirect !== "/dashboard"
    ? `/register?redirect=${encodeURIComponent(redirect)}`
    : "/register";

  return (
    <Card className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-text-secondary text-sm mt-1">
          Log in to CircleBet
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {login.error && (
          <p className="text-sm text-red">{login.error.message}</p>
        )}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={login.isPending}
        >
          Log In
        </Button>
      </form>
      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-text-secondary">or</span>
            </div>
          </div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(response) => {
                if (response.credential) {
                  googleAuth.mutate(response.credential, {
                    onSuccess: () => router.push(redirect),
                  });
                }
              }}
              onError={() => {}}
            />
          </div>
          {googleAuth.error && (
            <p className="text-sm text-red text-center">{googleAuth.error.message}</p>
          )}
        </>
      )}
      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href={registerHref} className="text-blue hover:underline">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
