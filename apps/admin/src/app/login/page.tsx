"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { toast } from "@/lib/toast";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    const result = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (result.error) {
      toast.error("Sign in failed", { description: result.error.message });
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <div className="flex flex-col justify-center items-center px-6 min-h-full">
      <div className="w-full max-w-sm">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          CRUD Admin
        </div>
        <h1 className="mt-2 font-heading text-3xl tracking-tight">Sign in</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Use an account with the admin role to manage entities and users.
        </p>

        <Form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </Form>
      </div>
    </div>
  );
}

