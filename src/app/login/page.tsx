"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import InputGroup from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { AUTH_SESSION_KEY } from "@/lib/constants";

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const fieldBaseId = useId();
  const fieldIds = useMemo(
    () => ({
      email: `${fieldBaseId}-email`,
      password: `${fieldBaseId}-password`,
    }),
    [fieldBaseId]
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    setIsMounted(true);

    const controller = new AbortController();

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              AUTH_SESSION_KEY,
              JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.fullName,
              })
            );
          }
          router.replace("/profile");
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to check session", error);
        }
      }
    };

    checkSession();

    return () => {
      controller.abort();
    };
  }, [router]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; user?: { id: string; email: string; fullName: string } }
        | null;

      if (!response.ok) {
        const message = data?.message ?? "Incorrect email or password. Please try again.";
        toast.error(message);
        return;
      }

      if (data?.user && typeof window !== "undefined") {
        window.localStorage.setItem(
          AUTH_SESSION_KEY,
          JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.fullName,
          })
        );
      }

      const firstName = data?.user?.fullName?.split(" ")[0] ?? "";
      toast.success(firstName ? `Welcome back, ${firstName}!` : "Logged in successfully!");
      router.push("/profile");
    } catch (error) {
      console.error(error);
      toast.error("We couldn't sign you in. Please try again later.");
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <section className="mx-auto mt-10 max-w-[520px] rounded-[24px] border border-black/10 bg-white p-6 sm:p-10">
          <h1
            className={cn(
              integralCF.className,
              "text-3xl sm:text-[40px] font-bold uppercase text-black"
            )}
          >
            Welcome back
          </h1>
          <p className="mt-3 text-base text-black/60">
            Log in to manage your saved details, track orders and pick up where
            you left off.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor={fieldIds.email}
                className="mb-2 block text-sm font-medium text-black"
              >
                Email address
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  type="email"
                  placeholder="name@example.com"
                  className="bg-transparent"
                  id={fieldIds.email}
                  autoComplete="email"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={
                    errors.email ? `${fieldIds.email}-error` : undefined
                  }
                  {...register("email")}
                />
              </InputGroup>
              {errors.email && (
                <p
                  id={`${fieldIds.email}-error`}
                  className="mt-2 text-sm text-red-500"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={fieldIds.password}
                className="mb-2 block text-sm font-medium text-black"
              >
                Password
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  type="password"
                  placeholder="Enter your password"
                  className="bg-transparent"
                  id={fieldIds.password}
                  autoComplete="current-password"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={
                    errors.password
                      ? `${fieldIds.password}-error`
                      : undefined
                  }
                  {...register("password")}
                />
              </InputGroup>
              {errors.password && (
                <p
                  id={`${fieldIds.password}-error`}
                  className="mt-2 text-sm text-red-500"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-[52px] w-full rounded-full bg-black text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/50"
            >
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-black/60">
            New to TSR Fashion?{" "}
            <Link href="/signup" className="font-semibold text-black">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
