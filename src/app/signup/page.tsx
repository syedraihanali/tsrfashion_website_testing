"use client";

import { useEffect, useState } from "react";
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

const AUTH_STORAGE_KEY = "tsr-fashion-users";

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

const getStoredUsers = () => {
  if (typeof window === "undefined") {
    return [] as SignupFormValues[];
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return [] as SignupFormValues[];
  }

  try {
    return JSON.parse(raw) as SignupFormValues[];
  } catch (error) {
    console.error("Failed to parse stored users", error);
    return [] as SignupFormValues[];
  }
};

export default function SignupPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
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

  const onSubmit = (values: SignupFormValues) => {
    try {
      const users = getStoredUsers();
      const alreadyExists = users.some(
        (user) => user.email.toLowerCase() === values.email.toLowerCase()
      );

      if (alreadyExists) {
        toast.error("An account with this email already exists.");
        return;
      }

      const nextUsers = [...users, values];
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUsers));
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
              <label className="mb-2 block text-sm font-medium text-black">
                Full name
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  placeholder="e.g. Nafisa Karim"
                  className="bg-transparent"
                  {...register("fullName")}
                />
              </InputGroup>
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Email address
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  type="email"
                  placeholder="name@example.com"
                  className="bg-transparent"
                  {...register("email")}
                />
              </InputGroup>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Mobile number
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="bg-transparent"
                  {...register("phone")}
                />
              </InputGroup>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Password
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  type="password"
                  placeholder="Create a strong password"
                  className="bg-transparent"
                  {...register("password")}
                />
              </InputGroup>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Confirm password
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  type="password"
                  placeholder="Re-enter your password"
                  className="bg-transparent"
                  {...register("confirmPassword")}
                />
              </InputGroup>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-500">
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
