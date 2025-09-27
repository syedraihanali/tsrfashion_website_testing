"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
} from "@/lib/profile-storage";

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

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  createdAt: string;
  updatedAt?: string;
};

type AuthStatus = "loading" | "guest" | "authenticated";

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const ProfileLoginForm = ({
  onLogin,
}: {
  onLogin: (user: CurrentUser) => void;
}) => {
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
        | {
            message?: string;
            user?: CurrentUser;
          }
        | null;

      if (!response.ok) {
        const message =
          data?.message ?? "Incorrect email or password. Please try again.";
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
            phone: data.user.phone ?? "",
          })
        );
        onLogin(data.user);
      }

      const firstName = data?.user?.fullName?.split(" ")[0] ?? "";
      toast.success(
        firstName
          ? `Welcome back, ${firstName}!`
          : "Logged in successfully!"
      );
    } catch (error) {
      console.error(error);
      toast.error("We couldn't sign you in. Please try again later.");
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-[520px] rounded-[24px] border border-black/10 bg-white p-6 sm:p-10">
      <h2
        className={cn(
          integralCF.className,
          "text-3xl sm:text-[40px] font-bold uppercase text-black"
        )}
      >
        Log in to continue
      </h2>
      <p className="mt-3 text-base text-black/60">
        Access your saved details, track orders, and speed up checkout by
        signing in to your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
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
            <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Password
          </label>
          <InputGroup className="bg-[#F0F0F0]">
            <InputGroup.Input
              type="password"
              placeholder="Enter your password"
              className="bg-transparent"
              autoComplete="current-password"
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password")}
            />
          </InputGroup>
          {errors.password && (
            <p className="mt-2 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-[54px] w-full rounded-full bg-black px-8 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/50"
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-black/60">
        New to TSR Fashion?{" "}
        <Link href="/signup" className="font-semibold text-black underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

const ProfileSummary = ({
  user,
  profile,
}: {
  user: CurrentUser;
  profile: StoredProfile | null;
}) => {
  const lastUpdated = useMemo(() => {
    if (!profile?.updatedAt) {
      return null;
    }

    return formatTimestamp(profile.updatedAt);
  }, [profile?.updatedAt]);

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="space-y-6 rounded-[24px] border border-black/10 bg-white p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-semibold text-black">Account details</h2>
          <p className="mt-1 text-sm text-black/60">
            Manage how your information appears across TSR Fashion.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-black/50">
              Full name
            </p>
            <p className="mt-1 text-base font-medium text-black">
              {user.fullName}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-black/50">
              Email
            </p>
            <p className="mt-1 text-base font-medium text-black">
              {user.email}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-black/50">
              Phone
            </p>
            <p className="mt-1 text-base font-medium text-black">
              {user.phone?.trim() ?? "Add a phone number"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#F7F7F7] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-black">
                Delivery preferences
              </h3>
              <p className="mt-1 text-sm text-black/60">
                Update your default delivery information for quicker checkout.
              </p>
            </div>
            <Button asChild className="hidden rounded-full px-5 lg:inline-flex">
              <Link href="/profile/update">Update details</Link>
            </Button>
          </div>

          {profile?.data ? (
            <div className="mt-5 space-y-3 text-sm text-black/70">
              <p className="font-medium text-black">
                {profile.data.fullName}
              </p>
              <p>
                {profile.data.addressLine1}
                {profile.data.apartment ? `, ${profile.data.apartment}` : ""}
              </p>
              <p>
                {profile.data.roadNo && `${profile.data.roadNo}, `}
                {profile.data.city} {profile.data.postalCode}
              </p>
              <p>
                {profile.data.phone} · {profile.data.email}
              </p>
              {profile.data.additionalInfo && (
                <p className="text-black/60">
                  Note: {profile.data.additionalInfo}
                </p>
              )}
              {lastUpdated && (
                <p className="text-xs uppercase tracking-wide text-black/40">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-5 text-sm text-black/60">
              You haven’t saved any delivery details yet. Click “Update
              details” to add your preferred address.
            </p>
          )}

          <Button
            asChild
            className="mt-5 w-full rounded-full px-5 lg:hidden"
          >
            <Link href="/profile/update">Update details</Link>
          </Button>
        </div>
      </div>

      <aside className="space-y-5 rounded-[24px] border border-black/10 bg-[#F7F7F7] p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-semibold text-black">
            Why keep your profile updated?
          </h2>
          <p className="mt-2 text-sm text-black/60">
            We store your details securely on your device so future orders are
            quicker. You can update these preferences anytime.
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
  );
};

export default function ProfilePage() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);

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

        const data = (await response.json()) as { user: CurrentUser };
        setUser(data.user);
        setStatus("authenticated");

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
        setProfile(stored);
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
  }, [isMounted]);

  const handleLogin = (nextUser: CurrentUser) => {
    setUser(nextUser);
    setStatus("authenticated");
    setProfile(getStoredProfile(nextUser.id));
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
            {profile?.updatedAt && (
              <span className="text-sm text-black/50">
                Last updated: {formatTimestamp(profile.updatedAt)}
              </span>
            )}
          </div>
        </header>

        {status === "authenticated" && user ? (
          <ProfileSummary user={user} profile={profile} />
        ) : null}

        {status === "guest" && !user ? (
          <ProfileLoginForm onLogin={handleLogin} />
        ) : null}
      </div>
    </main>
  );
}
