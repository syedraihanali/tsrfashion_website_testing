"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import InputGroup from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bangladeshDivisions } from "@/lib/bd-locations";
import { toast } from "react-toastify";

const PROFILE_STORAGE_KEY = "tsr-fashion-profile";

const profileSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .min(1, "Full name is required"),
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone: z
    .string({ required_error: "Phone number is required" })
    .min(11, "Enter a valid Bangladeshi phone number")
    .max(15, "Enter a valid Bangladeshi phone number")
    .regex(
      /^(?:\+?88)?01[3-9]\d{8}$/,
      "Enter a valid Bangladeshi phone number"
    ),
  division: z
    .string({ required_error: "Division is required" })
    .min(1, "Division is required"),
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

type ProfileFormValues = z.infer<typeof profileSchema>;

type StoredProfile = {
  data: ProfileFormValues;
  updatedAt?: string;
};

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getStoredProfile = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredProfile;
    profileSchema.parse(parsed.data);
    return parsed;
  } catch (error) {
    console.error("Failed to parse stored profile", error);
    return null;
  }
};

export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const {
    control,
    register,
    reset,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onSubmit",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      division: "",
      city: "",
      postalCode: "",
      addressLine1: "",
      apartment: "",
      roadNo: "",
      additionalInfo: "",
    },
  });

  const divisionValue = watch("division");
  const cityValue = watch("city");

  const availableCities = useMemo(() => {
    const division = bangladeshDivisions.find(
      (item) => item.name === divisionValue
    );

    return division ? division.cities : [];
  }, [divisionValue]);

  useEffect(() => {
    setIsMounted(true);
    const profile = getStoredProfile();

    if (profile) {
      reset(profile.data);
      if (profile.updatedAt) {
        setLastUpdated(formatTimestamp(profile.updatedAt));
      }
    }
  }, [reset]);

  useEffect(() => {
    if (availableCities.length === 0) {
      setValue("city", "");
      return;
    }

    if (cityValue && !availableCities.includes(cityValue)) {
      setValue("city", "");
    }
  }, [availableCities, cityValue, setValue]);

  const onSubmit = (values: ProfileFormValues) => {
    try {
      const timestamp = new Date();
      window.localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({ data: values, updatedAt: timestamp.toISOString() })
      );
      setLastUpdated(
        formatTimestamp(timestamp.toISOString())
      );
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Unable to save your profile. Please try again.");
    }
  };

  if (!isMounted) {
    return null;
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
            Your profile
          </h1>
          <p className="mt-3 max-w-2xl text-base text-black/60">
            Manage your personal details and default delivery address. Keeping
            this information current helps us speed up future checkouts.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/order-tracking"
              className="inline-flex h-[48px] items-center justify-center rounded-full border border-black/15 px-6 text-sm font-medium text-black transition hover:border-black"
            >
              Track an order
            </Link>
            <Link
              href="/cart"
              className="inline-flex h-[48px] items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white hover:bg-black/90"
            >
              View cart
            </Link>
            {lastUpdated && (
              <span className="text-sm text-black/50">
                Last updated: {lastUpdated}
              </span>
            )}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 rounded-[24px] border border-black/10 bg-white p-6 sm:p-8"
          >
            <div>
              <h2 className="text-xl font-semibold text-black">
                Account details
              </h2>
              <p className="mt-1 text-sm text-black/60">
                Update how your name and contact details appear across TSR
                Fashion.
              </p>
            </div>

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
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black">
                Default delivery address
              </h2>
              <p className="mt-1 text-sm text-black/60">
                Used to pre-fill future checkout forms. You can still override
                these details during checkout.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Division
                </label>
                <Controller
                  name="division"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="h-12 rounded-full border-black/20 bg-[#F0F0F0] px-4 text-sm">
                        <SelectValue placeholder="Select a division" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-black/10">
                        {bangladeshDivisions.map((division) => (
                          <SelectItem key={division.name} value={division.name}>
                            {division.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.division && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.division.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  City / District
                </label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={availableCities.length === 0}
                    >
                      <SelectTrigger className="h-12 rounded-full border-black/20 bg-[#F0F0F0] px-4 text-sm disabled:opacity-60">
                        <SelectValue
                          placeholder={
                            availableCities.length > 0
                              ? "Select a city"
                              : "Select division first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-black/10">
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
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
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
            </div>

            <div className="flex items-center justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-[52px] rounded-full bg-black px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/50"
              >
                Save changes
              </Button>
            </div>
          </form>

          <aside className="space-y-5 rounded-[24px] border border-black/10 bg-[#F7F7F7] p-6 sm:p-8">
            <div>
              <h2 className="text-xl font-semibold text-black">
                Why keep your profile updated?
              </h2>
              <p className="mt-2 text-sm text-black/60">
                We store your details securely on your device so future orders
                are quicker. You can update these preferences anytime.
              </p>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-sm text-black/60">
              <li>Faster checkout with auto-filled delivery forms.</li>
              <li>Receive order notifications to the correct email.</li>
              <li>Ensure our couriers have the right contact number.</li>
            </ul>
            <div className="rounded-2xl border border-dashed border-black/20 bg-white/70 p-5">
              <h3 className="text-base font-semibold text-black">
                Need to update your password?
              </h3>
              <p className="mt-1 text-sm text-black/60">
                Head to the login page to reset it securely with your email
                address.
              </p>
              <Link
                href="/login"
                className="mt-3 inline-flex h-[44px] items-center justify-center rounded-full border border-black/20 px-5 text-sm font-medium text-black transition hover:border-black"
              >
                Go to login
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
