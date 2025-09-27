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

const signupSchema = z
  .object({
    fullName: z
      .string({ required_error: "Full name is required" })
      .min(1, "Full name is required"),
    email: z
      .string({ required_error: "Email is required" })
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    phone: z
      .string({ required_error: "Phone number is required" })
      .min(11, "Enter a valid phone number")
      .max(15, "Enter a valid phone number"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Use at least 6 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm your password" })
      .min(6, "Use at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const fieldBaseId = useId();
  const fieldIds = useMemo(
    () => ({
      fullName: `${fieldBaseId}-full-name`,
      email: `${fieldBaseId}-email`,
      phone: `${fieldBaseId}-phone`,
      password: `${fieldBaseId}-password`,
      confirmPassword: `${fieldBaseId}-confirm-password`,
    }),
    [fieldBaseId]
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          password: values.password,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        toast.error(data?.message ?? "We couldn't complete your registration. Please try again.");
        return;
      }

      toast.success("Account created successfully! You can now log in.");
      reset();
      router.push("/login");
    } catch (error) {
      console.error(error);
      toast.error("We couldn't complete your registration. Please try again.");
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
            Join TSR Fashion
          </h1>
          <p className="mt-3 text-base text-black/60">
            Create an account to save your favourite products and enjoy a faster
            checkout experience across devices.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor={fieldIds.fullName}
                className="mb-2 block text-sm font-medium text-black"
              >
                Full name
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  placeholder="e.g. Nafisa Karim"
                  className="bg-transparent"
                  id={fieldIds.fullName}
                  autoComplete="name"
                  aria-invalid={errors.fullName ? "true" : "false"}
                  aria-describedby={
                    errors.fullName
                      ? `${fieldIds.fullName}-error`
                      : undefined
                  }
                  {...register("fullName")}
                />
              </InputGroup>
              {errors.fullName && (
                <p
                  id={`${fieldIds.fullName}-error`}
                  className="mt-2 text-sm text-red-500"
                  role="alert"
                >
                  {errors.fullName.message}
                </p>
              )}
            </div>

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
                htmlFor={fieldIds.phone}
                className="mb-2 block text-sm font-medium text-black"
              >
                Mobile number
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="bg-transparent"
                  id={fieldIds.phone}
                  autoComplete="tel"
                  aria-invalid={errors.phone ? "true" : "false"}
                  aria-describedby={
                    errors.phone ? `${fieldIds.phone}-error` : undefined
                  }
                  {...register("phone")}
                />
              </InputGroup>
              {errors.phone && (
                <p
                  id={`${fieldIds.phone}-error`}
                  className="mt-2 text-sm text-red-500"
                  role="alert"
                >
                  {errors.phone.message}
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
                  placeholder="Create a strong password"
                  className="bg-transparent"
                  id={fieldIds.password}
                  autoComplete="new-password"
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

            <div>
              <label
                htmlFor={fieldIds.confirmPassword}
                className="mb-2 block text-sm font-medium text-black"
              >
                Confirm password
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  type="password"
                  placeholder="Re-enter your password"
                  className="bg-transparent"
                  id={fieldIds.confirmPassword}
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  aria-describedby={
                    errors.confirmPassword
                      ? `${fieldIds.confirmPassword}-error`
                      : undefined
                  }
                  {...register("confirmPassword")}
                />
              </InputGroup>
              {errors.confirmPassword && (
                <p
                  id={`${fieldIds.confirmPassword}-error`}
                  className="mt-2 text-sm text-red-500"
                  role="alert"
                >
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-[52px] w-full rounded-full bg-black text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/50"
            >
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-black/60">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-black">
              Log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
