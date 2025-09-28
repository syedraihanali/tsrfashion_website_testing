"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof schema>;

export const AdminLoginCard = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginValues) => {
    setServerError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(values),
        });

        const data = (await response.json().catch(() => null)) as { message?: string } | null;

        if (!response.ok) {
          const message = data?.message ?? "Unable to sign you in. Please try again.";
          setServerError(message);
          toast.error(message);
          return;
        }

        toast.success("Welcome back, admin!");
        router.refresh();
      } catch (error) {
        console.error("Admin login failed", error);
        const message = "We couldn't sign you in. Please try again.";
        setServerError(message);
        toast.error(message);
      }
    });
  };

  return (
    <Card className="w-full max-w-md bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Admin Portal</CardTitle>
        <CardDescription>
          Sign in with your administrator credentials to access the TSR Fashion back office.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email" error={!!errors.email}>
              Email
            </Label>
            <Input id="email" type="email" placeholder="admin@mail.com" autoComplete="email" {...register("email")} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Use the email provided by the TSR Fashion leadership team.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" error={!!errors.password}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Passwords are case sensitive and provided securely by HQ.</p>
            )}
          </div>

          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
