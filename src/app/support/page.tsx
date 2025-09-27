"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";

const supportSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .min(1, "Full name is required"),
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  subject: z
    .string({ required_error: "Subject is required" })
    .min(1, "Subject is required")
    .max(150, "Subject is too long"),
  orderNumber: z.string().optional(),
  message: z
    .string({ required_error: "Message is required" })
    .min(1, "Message is required")
    .max(2000, "Message is too long"),
});

type SupportFormValues = z.infer<typeof supportSchema>;

export default function SupportPage() {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      fullName: "",
      email: "",
      subject: "",
      orderNumber: "",
      message: "",
    },
  });

  const onSubmit = async (values: SupportFormValues) => {
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        toast.error(
          data?.message ??
            "We couldn't send your message. Please try again shortly."
        );
        return;
      }

      toast.success("Thanks! Our team will be in touch soon.");
      setHasSubmitted(true);
      reset();
    } catch (error) {
      console.error("Failed to submit support request", error);
      toast.error("We couldn't send your message. Please try again shortly.");
    }
  };

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
            We&apos;re here to help
          </h1>
          <p className="mt-3 max-w-3xl text-base text-black/60">
            Send us a message and our support team will respond within 24 hours.
            You can also browse our <Link href="/order-tracking" className="font-semibold text-black underline">order tracking</Link> page for delivery updates.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section className="space-y-6 rounded-[24px] border border-black/10 bg-white p-6 sm:p-8">
            <div>
              <h2 className="text-xl font-semibold text-black">
                Contact support
              </h2>
              <p className="mt-1 text-sm text-black/60">
                Fill out the form below and we&apos;ll get back to you as soon as we
                can.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Full name
                  </label>
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Input
                      type="text"
                      placeholder="Your full name"
                      className="bg-transparent"
                      autoComplete="name"
                      aria-invalid={errors.fullName ? "true" : "false"}
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
                      autoComplete="email"
                      aria-invalid={errors.email ? "true" : "false"}
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

              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Subject
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="text"
                    placeholder="How can we help?"
                    className="bg-transparent"
                    aria-invalid={errors.subject ? "true" : "false"}
                    {...register("subject")}
                  />
                </InputGroup>
                {errors.subject && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Order ID (optional)
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="text"
                    placeholder="e.g. TSR-105284"
                    className="bg-transparent uppercase"
                    aria-invalid={errors.orderNumber ? "true" : "false"}
                    {...register("orderNumber")}
                  />
                </InputGroup>
                {errors.orderNumber && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.orderNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Message
                </label>
                <div className="rounded-[20px] border border-black/10 bg-[#F0F0F0] p-4">
                  <textarea
                    rows={6}
                    placeholder="Tell us more about the issue you&apos;re experiencing"
                    className="w-full resize-none bg-transparent text-sm text-black outline-none"
                    aria-invalid={errors.message ? "true" : "false"}
                    {...register("message")}
                  />
                </div>
                {errors.message && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-[52px] w-full rounded-full bg-black px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/50"
              >
                {isSubmitting ? "Sending…" : "Send message"}
              </Button>

              {hasSubmitted && (
                <p className="text-sm text-emerald-600">
                  We&apos;ve received your message. You&apos;ll hear from us very soon.
                </p>
              )}
            </form>
          </section>

          <aside className="space-y-6 rounded-[24px] border border-black/10 bg-[#F7F7F7] p-6 sm:p-8">
            <div>
              <h2 className="text-xl font-semibold text-black">
                Quick answers
              </h2>
              <p className="mt-1 text-sm text-black/60">
                Check our <Link href="/order-tracking" className="font-semibold text-black underline">order tracking</Link> page to see the latest status of your delivery.
              </p>
            </div>
            <div className="space-y-4 text-sm text-black/70">
              <div>
                <p className="font-semibold text-black">Business hours</p>
                <p>Saturday - Thursday, 9am to 8pm BST</p>
              </div>
              <div>
                <p className="font-semibold text-black">Email</p>
                <p>support@tsrfashion.com</p>
              </div>
              <div>
                <p className="font-semibold text-black">Hotline</p>
                <p>+880 9611-123456</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
