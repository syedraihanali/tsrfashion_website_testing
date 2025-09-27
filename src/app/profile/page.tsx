"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const profileUpdateSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .min(1, "Full name is required")
    .max(255, "Full name is too long"),
  phone: z
    .union([
      z
        .string()
        .min(6, "Enter a valid phone number")
        .max(20, "Enter a valid phone number"),
      z.literal(""),
    ])
    .optional()
    .transform((value) => value ?? ""),
});

type ProfileFormValues = z.infer<typeof profileUpdateSchema>;

const passwordUpdateSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm your new password" })
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordUpdateSchema>;

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
            Use the form below to change it instantly and keep your account
            secure. We&apos;ll log you out of other devices automatically.
          </p>
          <Link
            href="/support"
            className="mt-3 inline-flex h-[44px] items-center justify-center rounded-full border border-black/20 px-5 text-sm font-medium text-black transition hover:border-black"
          >
            Contact support
          </Link>
        </div>
      </aside>
    </section>
  );
};

const AccountUpdateForm = ({
  user,
  onUserUpdate,
}: {
  user: CurrentUser;
  onUserUpdate: (nextUser: CurrentUser) => void;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: user.fullName,
      phone: user.phone ?? "",
    },
  });

  useEffect(() => {
    reset({
      fullName: user.fullName,
      phone: user.phone ?? "",
    });
  }, [reset, user.fullName, user.phone]);

  const onSubmit = async (values: ProfileFormValues) => {
    const normalizedFullName = values.fullName.trim();
    const normalizedPhone = values.phone.trim();

    const payload: { fullName?: string; phone?: string } = {};

    if (normalizedFullName !== user.fullName) {
      payload.fullName = normalizedFullName;
    }

    if (normalizedPhone !== (user.phone ?? "")) {
      payload.phone = normalizedPhone;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No changes to update.");
      return;
    }

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as
        | { user?: CurrentUser; message?: string }
        | null;

      if (!response.ok) {
        toast.error(
          data?.message ?? "We couldn't update your profile. Please try again."
        );
        return;
      }

      if (data?.user) {
        onUserUpdate(data.user);
        reset({
          fullName: data.user.fullName,
          phone: data.user.phone ?? "",
        });
      }

      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("We couldn't update your profile. Please try again.");
    }
  };

  return (
    <section className="space-y-6 rounded-[24px] border border-black/10 bg-white p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-black">Update account</h2>
        <p className="mt-1 text-sm text-black/60">
          Update your name or phone number. These details help us personalise
          your experience and contact you about orders.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            Phone number
          </label>
          <InputGroup className="bg-[#F0F0F0]">
            <InputGroup.Input
              type="tel"
              placeholder="Add a contact number"
              className="bg-transparent"
              autoComplete="tel"
              aria-invalid={errors.phone ? "true" : "false"}
              {...register("phone")}
            />
          </InputGroup>
          <p className="mt-2 text-xs text-black/50">
            Leave blank to remove your phone number from your profile.
          </p>
          {errors.phone && (
            <p className="mt-2 text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-[50px] rounded-full bg-black px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/50"
        >
          {isSubmitting ? "Saving changes…" : "Save changes"}
        </Button>
      </form>
    </section>
  );
};

const PasswordUpdateForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      const response = await fetch("/api/auth/password", {
        method: "PATCH",
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
          data?.message ?? "We couldn't update your password. Please try again."
        );
        return;
      }

      toast.success("Password updated successfully.");
      reset();
    } catch (error) {
      console.error("Failed to update password", error);
      toast.error("We couldn't update your password. Please try again.");
    }
  };

  return (
    <section className="space-y-6 rounded-[24px] border border-black/10 bg-white p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-black">
          Change your password
        </h2>
        <p className="mt-1 text-sm text-black/60">
          For your security, you will need your current password. Choose a new
          password that you haven&apos;t used before.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Current password
          </label>
          <InputGroup className="bg-[#F0F0F0]">
            <InputGroup.Input
              type="password"
              placeholder="Enter current password"
              className="bg-transparent"
              autoComplete="current-password"
              aria-invalid={errors.currentPassword ? "true" : "false"}
              {...register("currentPassword")}
            />
          </InputGroup>
          {errors.currentPassword && (
            <p className="mt-2 text-sm text-red-500">
              {errors.currentPassword.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            New password
          </label>
          <InputGroup className="bg-[#F0F0F0]">
            <InputGroup.Input
              type="password"
              placeholder="Create a new password"
              className="bg-transparent"
              autoComplete="new-password"
              aria-invalid={errors.newPassword ? "true" : "false"}
              {...register("newPassword")}
            />
          </InputGroup>
          {errors.newPassword && (
            <p className="mt-2 text-sm text-red-500">
              {errors.newPassword.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Confirm new password
          </label>
          <InputGroup className="bg-[#F0F0F0]">
            <InputGroup.Input
              type="password"
              placeholder="Re-enter new password"
              className="bg-transparent"
              autoComplete="new-password"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
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
          className="h-[50px] rounded-full bg-black px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/50"
        >
          {isSubmitting ? "Updating password…" : "Update password"}
        </Button>
      </form>
    </section>
  );
};

export default function ProfilePage() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const persistSession = useCallback((sessionUser: CurrentUser) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({
        id: sessionUser.id,
        email: sessionUser.email,
        fullName: sessionUser.fullName,
        phone: sessionUser.phone ?? "",
      })
    );
  }, []);

  const handleProfileUpdated = useCallback(
    (nextUser: CurrentUser) => {
      setUser(nextUser);
      persistSession(nextUser);
    },
    [persistSession]
  );

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
        persistSession(data.user);

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
  }, [isMounted, persistSession]);

  const handleLogin = (nextUser: CurrentUser) => {
    setUser(nextUser);
    setStatus("authenticated");
    persistSession(nextUser);
    setProfile(getStoredProfile(nextUser.id));
  };

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        toast.error(
          data?.message ?? "We couldn't log you out. Please try again."
        );
        setIsLoggingOut(false);
        return;
      }
    } catch (error) {
      console.error("Failed to log out", error);
      toast.error("We couldn't log you out. Please try again.");
      setIsLoggingOut(false);
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_SESSION_KEY);
    }

    setUser(null);
    setProfile(null);
    setStatus("guest");
    toast.success("You have been logged out.");
    setIsLoggingOut(false);
  }, [isLoggingOut]);

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
          <>
            <ProfileSummary user={user} profile={profile} />
            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <AccountUpdateForm
                user={user}
                onUserUpdate={handleProfileUpdated}
              />
              <div className="space-y-6">
                <PasswordUpdateForm />
                <section className="rounded-[24px] border border-black/10 bg-white p-6 sm:p-8">
                  <h2 className="text-xl font-semibold text-black">Sign out</h2>
                  <p className="mt-1 text-sm text-black/60">
                    Log out to end your session on this device. You&apos;ll need your
                    password to sign back in.
                  </p>
                  <Button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-5 h-[50px] w-full rounded-full border border-black/15 bg-white text-sm font-semibold text-black transition hover:border-black disabled:cursor-not-allowed disabled:border-black/30 disabled:text-black/40"
                  >
                    {isLoggingOut ? "Signing out…" : "Log out"}
                  </Button>
                </section>
              </div>
            </div>
          </>
        ) : null}

        {status === "guest" && !user ? (
          <ProfileLoginForm onLogin={handleLogin} />
        ) : null}
      </div>
    </main>
  );
}
