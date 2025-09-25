"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bangladeshDivisions } from "@/lib/bd-locations";
import { FaCheckCircle } from "react-icons/fa";
import { HiOutlineHomeModern } from "react-icons/hi2";
import { MdOutlinePayments } from "react-icons/md";

const checkoutSchema = z.object({
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

const paymentMethods = [
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay when your package arrives at your doorstep.",
  },
  {
    id: "bkash",
    title: "bKash",
    description: "Secure digital payment through your bKash wallet.",
  },
  {
    id: "nagad",
    title: "Nagad",
    description: "Instant payment using your Nagad mobile wallet.",
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Use any Bangladeshi issued Visa, Mastercard or AMEX.",
  },
] as const;

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type CheckoutStep = "address" | "payment";

export default function CheckoutPage() {
  const isAuthenticated = false;
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>("address");
  const [shippingDetails, setShippingDetails] =
    useState<CheckoutFormValues | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("");

  const {
    control,
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
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
    mode: "onSubmit",
  });

  const selectedDivision = watch("division");
  const currentCity = watch("city");
  const availableCities = useMemo(() => {
    const division = bangladeshDivisions.find(
      (item) => item.name === selectedDivision
    );
    return division ? division.cities : [];
  }, [selectedDivision]);

  useEffect(() => {
    if (availableCities.length === 0) {
      setValue("city", "");
      return;
    }

    if (!availableCities.includes(currentCity)) {
      setValue("city", "");
    }
  }, [availableCities, currentCity, setValue]);

  const onSubmit = (values: CheckoutFormValues) => {
    setShippingDetails(values);
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmOrder = () => {
    router.push("/");
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: "address" as const, label: "Delivery Details" },
      { id: "payment" as const, label: "Payment" },
    ];

    return (
      <div className="flex items-center space-x-3 md:space-x-5 mb-8">
        {steps.map((item, index) => {
          const isActive = step === item.id;
          const isCompleted =
            step === "payment" && item.id === "address" && shippingDetails;
          return (
            <React.Fragment key={item.id}>
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold",
                    isActive
                      ? "border-black bg-black text-white"
                      : isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-black/20 bg-white text-black/60"
                  )}
                >
                  {isCompleted ? <FaCheckCircle className="text-lg" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium uppercase tracking-wide",
                    isActive ? "text-black" : "text-black/50"
                  )}
                >
                  {item.label}
                </span>
              </div>
              {index !== steps.length - 1 && (
                <div className="h-px flex-1 bg-black/10" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <header className="mb-10">
          <h1
            className={cn(
              integralCF.className,
              "text-3xl md:text-[40px] uppercase font-bold text-black"
            )}
          >
            Checkout
          </h1>
          <p className="text-black/60 mt-2 max-w-2xl">
            Complete your delivery details and secure payment to finish your
            order. We currently support Bangladeshi addresses and popular local
            payment methods.
          </p>
        </header>

        {renderStepIndicator()}

        {isAuthenticated ? (
          <section className="rounded-[24px] border border-black/10 bg-[#F7F7F7] p-6 md:p-10">
            <div className="flex items-start space-x-4">
              <HiOutlineHomeModern className="text-3xl text-black/60" />
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-black">
                  Saved addresses
                </h2>
                <p className="mt-2 text-black/60">
                  You are logged in. Select one of your saved addresses to
                  continue. Address management will be available once
                  authentication is completed.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section>
            {step === "address" && (
              <form
                className="grid gap-6 rounded-[24px] border border-black/10 bg-white p-6 md:p-10"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black">
                      Phone number
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="h-[54px] rounded-full bg-black px-8 text-base font-semibold text-white"
                  >
                    Continue to payment
                  </Button>
                </div>
              </form>
            )}

            {step === "payment" && shippingDetails && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <section className="rounded-[24px] border border-black/10 bg-white p-6 md:p-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <HiOutlineHomeModern className="text-3xl text-black/70" />
                      <div>
                        <h2 className="text-xl font-semibold text-black">
                          Delivery address
                        </h2>
                        <p className="mt-2 text-sm text-black/70">
                          {shippingDetails.fullName}
                        </p>
                        <p className="text-sm text-black/70">
                          {shippingDetails.addressLine1}
                          {shippingDetails.apartment
                            ? `, ${shippingDetails.apartment}`
                            : ""}
                        </p>
                        <p className="text-sm text-black/70">
                          {shippingDetails.roadNo && `${shippingDetails.roadNo}, `}
                          {shippingDetails.city}, {shippingDetails.division} {" "}
                          {shippingDetails.postalCode}
                        </p>
                        <p className="mt-2 text-sm text-black/70">
                          {shippingDetails.phone} · {shippingDetails.email}
                        </p>
                        {shippingDetails.additionalInfo && (
                          <p className="mt-2 text-sm text-black/60">
                            Note: {shippingDetails.additionalInfo}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="hidden text-sm font-medium text-black underline-offset-4 hover:underline lg:inline-flex"
                      onClick={() => setStep("address")}
                      type="button"
                    >
                      Edit
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-6 w-full rounded-full border-black/20 py-3 text-sm font-semibold lg:hidden"
                    type="button"
                    onClick={() => setStep("address")}
                  >
                    Edit delivery details
                  </Button>
                </section>

                <section className="rounded-[24px] border border-black/10 bg-white p-6 md:p-10">
                  <div className="flex items-center space-x-3">
                    <MdOutlinePayments className="text-2xl text-black/70" />
                    <h2 className="text-xl font-semibold text-black">
                      Payment method
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-black/60">
                    Choose a payment option to continue. We support popular
                    Bangladeshi gateways and cash on delivery.
                  </p>
                  <div className="mt-6 grid gap-4">
                    {paymentMethods.map((method) => {
                      const isActive = selectedPayment === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPayment(method.id)}
                          className={cn(
                            "w-full rounded-2xl border px-5 py-4 text-left transition-colors",
                            isActive
                              ? "border-black bg-black text-white shadow-lg"
                              : "border-black/15 bg-[#F8F8F8] hover:border-black/40"
                          )}
                        >
                          <p className="text-base font-semibold">{method.title}</p>
                          <p
                            className={cn(
                              "mt-1 text-sm",
                              isActive ? "text-white/80" : "text-black/60"
                            )}
                          >
                            {method.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={!selectedPayment}
                    className="mt-8 h-[54px] w-full rounded-full bg-black text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/50"
                  >
                    Confirm order
                  </Button>
                </section>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
