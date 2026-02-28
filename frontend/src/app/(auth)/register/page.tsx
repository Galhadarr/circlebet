"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useRegister, useGoogleAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const register = useRegister();
  const googleAuth = useGoogleAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    register.mutate(
      { email, password, display_name: displayName },
      { onSuccess: () => router.push(redirect) }
    );
  }

  const loginHref = redirect !== "/dashboard"
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : "/login";

  return (
    <Card className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-text-secondary text-sm mt-1">
          Join CircleBet
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Display Name"
          placeholder="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
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
          minLength={6}
        />
        {register.error && (
          <p className="text-sm text-red">{register.error.message}</p>
        )}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={register.isPending}
        >
          Create Account
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
              locale="en"
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
        Already have an account?{" "}
        <Link href={loginHref} className="text-blue hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
