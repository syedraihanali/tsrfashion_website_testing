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
import { AUTH_SESSION_KEY } from "@/lib/constants";
import {
  StoredProfile,
  getStoredProfile,
  setStoredProfile,
} from "@/lib/profile-storage";

const updateSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .min(1, "Full name is required"),
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone: z
    .string({ required_error: "Phone number is required" })
    .min(6, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
  city: z
    .string({ required_error: "City is required" })
    .min(1, "City is required"),
  postalCode: z
    .string({ required_error: "Postal code is required" })
    .min(4, "Postal code must be at least 4 digits")
    .max(6, "Postal code must be at most 6 digits")
    .regex(/^[0-9]+$/, "Postal code must only contain numbers"),
  addressLine1: z
    .string({ required_error: "Street address is required" })
    .min(1, "Street address is required"),
  apartment: z.string().optional(),
  roadNo: z.string().optional(),
  additionalInfo: z.string().optional(),
});

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

type UpdateFormValues = z.infer<typeof updateSchema>;

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
};

type AuthStatus = "loading" | "guest" | "authenticated";

export default function ProfileUpdatePage() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [storedProfile, setStoredProfileState] = useState<StoredProfile | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      postalCode: "",
      addressLine1: "",
      apartment: "",
      roadNo: "",
      additionalInfo: "",
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const controller = new AbortController();

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          setStatus("guest");
          setUser(null);
          return;
        }

        const data = (await response.json()) as {
          user: CurrentUser & { updatedAt?: string };
        };

        setStatus("authenticated");
        setUser(data.user);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            AUTH_SESSION_KEY,
            JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              fullName: data.user.fullName,
              phone: data.user.phone ?? "",
            })
          );
        }

        const stored = getStoredProfile(data.user.id);
        setStoredProfileState(stored);

        reset({
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone ?? "",
          city: stored?.data.city ?? "",
          postalCode: stored?.data.postalCode ?? "",
          addressLine1: stored?.data.addressLine1 ?? "",
          apartment: stored?.data.apartment ?? "",
          roadNo: stored?.data.roadNo ?? "",
          additionalInfo: stored?.data.additionalInfo ?? "",
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("Failed to fetch current user", error);
        setStatus("guest");
        setUser(null);
      }
    };

    fetchCurrentUser();

    return () => {
      controller.abort();
    };
  }, [isMounted, reset]);

  const onSubmit = async (values: UpdateFormValues) => {
    if (!user) {
      return;
    }

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: values.fullName,
          phone: values.phone,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; user?: CurrentUser & { updatedAt?: string } }
        | null;

      if (!response.ok) {
        toast.error(data?.message ?? "Unable to update your profile.");
        return;
      }

      const timestamp = new Date().toISOString();

      setStoredProfile(user.id, {
        data: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          city: values.city,
          postalCode: values.postalCode,
          addressLine1: values.addressLine1,
          apartment: values.apartment,
          roadNo: values.roadNo,
          additionalInfo: values.additionalInfo,
        },
        updatedAt: timestamp,
      });

      setStoredProfileState({
        data: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          city: values.city,
          postalCode: values.postalCode,
          addressLine1: values.addressLine1,
          apartment: values.apartment,
          roadNo: values.roadNo,
          additionalInfo: values.additionalInfo,
        },
        updatedAt: timestamp,
      });

      toast.success("Profile updated successfully.");
      router.push("/profile");
    } catch (error) {
      console.error(error);
      toast.error("Unable to update your profile. Please try again.");
    }
  };

  if (!isMounted) {
    return null;
  }

  if (status === "guest") {
    return (
      <main className="pb-20">
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <section className="mx-auto mt-10 max-w-[520px] rounded-[24px] border border-black/10 bg-white p-6 sm:p-10 text-center">
            <h1
              className={cn(
                integralCF.className,
                "text-3xl sm:text-[40px] font-bold uppercase text-black"
              )}
            >
              Log in required
            </h1>
            <p className="mt-3 text-base text-black/60">
              Sign in to update your saved details and delivery preferences.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="rounded-full px-6 py-3">
                <Link href="/login">Go to login</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-full border-black/20 px-6 py-3 text-black"
              >
                <Link href="/signup">Create an account</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <header className="pt-8 pb-10 sm:pb-12">
          <h1
            className={cn(
              integralCF.className,
              "text-3xl sm:text-[40px] font-bold uppercase text-black"
            )}
          >
            Update your details
          </h1>
          <p className="mt-3 max-w-2xl text-base text-black/60">
            Refresh your personal and delivery information to ensure smooth
            checkouts and on-time deliveries.
          </p>
          {storedProfile?.updatedAt && (
            <p className="mt-2 text-sm text-black/50">
              Last updated {formatTimestamp(storedProfile.updatedAt)}
            </p>
          )}
        </header>

        {status === "authenticated" && user ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 rounded-[24px] border border-black/10 bg-white p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Full name
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    placeholder="e.g. Rahim Uddin"
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
                    disabled
                    {...register("email")}
                  />
                </InputGroup>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                  <p className="mt-2 text-sm text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  City / District
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    placeholder="e.g. Dhaka"
                    className="bg-transparent"
                    {...register("city")}
                  />
                </InputGroup>
                {errors.city && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Postal code
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 1207"
                    className="bg-transparent"
                    {...register("postalCode")}
                  />
                </InputGroup>
                {errors.postalCode && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Street address
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    placeholder="House, road number"
                    className="bg-transparent"
                    {...register("addressLine1")}
                  />
                </InputGroup>
                {errors.addressLine1 && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Apartment / Floor (optional)
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    placeholder="Apartment, floor, block"
                    className="bg-transparent"
                    {...register("apartment")}
                  />
                </InputGroup>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Road number (optional)
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    placeholder="Road / holding number"
                    className="bg-transparent"
                    {...register("roadNo")}
                  />
                </InputGroup>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Delivery notes (optional)
              </label>
              <div className="rounded-2xl border border-black/10 bg-[#F0F0F0] px-4 py-3">
                <textarea
                  rows={3}
                  className="h-full w-full resize-none bg-transparent text-sm outline-none placeholder:text-sm placeholder:text-black/40"
                  placeholder="Nearby landmark or delivery instruction"
                  {...register("additionalInfo")}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-black/20 px-6 text-sm font-medium text-black"
                onClick={() => router.push("/profile")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-[52px] rounded-full bg-black px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/50"
              >
                Save changes
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </main>
  );
}
