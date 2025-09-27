"use client";

import React, { useEffect, useMemo, useState, useId } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { FaCheckCircle } from "react-icons/fa";
import { HiOutlineHomeModern } from "react-icons/hi2";
import { MdOutlinePayments } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import {
  CartItem,
  clearCart,
} from "@/lib/features/carts/cartsSlice";
import {
  ORDER_STORAGE_KEY,
  OrderTracking,
} from "@/lib/data/orders";
import { toast } from "react-toastify";
import { AUTH_SESSION_KEY } from "@/lib/constants";
import {
  StoredProfile,
  getStoredProfile,
  setStoredProfile,
} from "@/lib/profile-storage";

const baseCheckoutSchema = z.object({
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

const guestCheckoutSchema = baseCheckoutSchema
  .extend({
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const authenticatedCheckoutSchema = baseCheckoutSchema.extend({
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
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

type CheckoutFormValues = z.infer<typeof guestCheckoutSchema>;

type CheckoutStep = "address" | "payment";

type AuthStatus = "loading" | "guest" | "authenticated";

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
};

const getCartItemFinalPrice = (item: CartItem) => {
  if (item.discount.percentage > 0) {
    return Math.round(
      item.price - (item.price * item.discount.percentage) / 100
    );
  }

  if (item.discount.amount > 0) {
    return Math.max(item.price - item.discount.amount, 0);
  }

  return item.price;
};

const ORDER_ESTIMATED_DELIVERY_DAYS = 4;

const generateOrderId = () =>
  `TSR-${Math.floor(100000 + Math.random() * 900000)}`;

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.carts);
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("address");
  const [shippingDetails, setShippingDetails] =
    useState<CheckoutFormValues | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const formBaseId = useId();
  const fieldIds = useMemo(
    () => ({
      fullName: `${formBaseId}-full-name`,
      email: `${formBaseId}-email`,
      phone: `${formBaseId}-phone`,
      city: `${formBaseId}-city`,
      postalCode: `${formBaseId}-postal-code`,
      addressLine1: `${formBaseId}-address-line-1`,
      apartment: `${formBaseId}-apartment`,
      roadNo: `${formBaseId}-road-no`,
      additionalInfo: `${formBaseId}-additional-info`,
      password: `${formBaseId}-password`,
      confirmPassword: `${formBaseId}-confirm-password`,
    }),
    [formBaseId]
  );

  const isAuthenticated = authStatus === "authenticated";

  const activeSchema = useMemo(
    () => (isAuthenticated ? authenticatedCheckoutSchema : guestCheckoutSchema),
    [isAuthenticated]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(activeSchema),
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
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
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
          setAuthStatus("guest");
          setCurrentUser(null);
          reset({
            fullName: "",
            email: "",
            phone: "",
            city: "",
            postalCode: "",
            addressLine1: "",
            apartment: "",
            roadNo: "",
            additionalInfo: "",
            password: "",
            confirmPassword: "",
          });
          return;
        }

        const data = (await response.json()) as { user: CurrentUser };
        setAuthStatus("authenticated");
        setCurrentUser(data.user);

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

        reset({
          fullName: stored?.data.fullName ?? data.user.fullName,
          email: data.user.email,
          phone: stored?.data.phone ?? data.user.phone ?? "",
          city: stored?.data.city ?? "",
          postalCode: stored?.data.postalCode ?? "",
          addressLine1: stored?.data.addressLine1 ?? "",
          apartment: stored?.data.apartment ?? "",
          roadNo: stored?.data.roadNo ?? "",
          additionalInfo: stored?.data.additionalInfo ?? "",
          password: "",
          confirmPassword: "",
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("Failed to fetch current user", error);
        setAuthStatus("guest");
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();

    return () => {
      controller.abort();
    };
  }, [isMounted, reset]);

  const onSubmit = (values: CheckoutFormValues) => {
    setShippingDetails(values);

    if (isAuthenticated && currentUser) {
      const timestamp = new Date().toISOString();
      const stored: StoredProfile = {
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
      };

      setStoredProfile(currentUser.id, stored);
    }

    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmOrder = async () => {
    if (!shippingDetails) {
      toast.error("Please provide delivery details before confirming.");
      setStep("address");
      return;
    }

    if (!selectedPayment) {
      toast.error("Select a payment method to continue.");
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty.");
      router.push("/cart");
      return;
    }

    if (authStatus === "guest") {
      if (!shippingDetails.password || !shippingDetails.confirmPassword) {
        toast.error("Create a password to continue.");
        setStep("address");
        return;
      }

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: shippingDetails.fullName,
            email: shippingDetails.email,
            phone: shippingDetails.phone,
            password: shippingDetails.password,
          }),
        });

        const data = (await response.json().catch(() => null)) as
          | {
              message?: string;
              user?: CurrentUser;
            }
          | null;

        if (!response.ok) {
          toast.error(
            data?.message ??
              "We couldn't create your account. Please try again."
          );
          setStep("address");
          return;
        }

        if (data?.user) {
          setAuthStatus("authenticated");
          setCurrentUser(data.user);

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

          const timestamp = new Date().toISOString();
          const stored: StoredProfile = {
            data: {
              fullName: shippingDetails.fullName,
              email: shippingDetails.email,
              phone: shippingDetails.phone,
              city: shippingDetails.city,
              postalCode: shippingDetails.postalCode,
              addressLine1: shippingDetails.addressLine1,
              apartment: shippingDetails.apartment,
              roadNo: shippingDetails.roadNo,
              additionalInfo: shippingDetails.additionalInfo,
            },
            updatedAt: timestamp,
          };

          setStoredProfile(data.user.id, stored);
        }

        setShippingDetails({
          ...shippingDetails,
          password: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.error("Failed to sign up during checkout", error);
        toast.error("We couldn't create your account. Please try again.");
        setStep("address");
        return;
      }
    } else if (isAuthenticated && currentUser) {
      const timestamp = new Date().toISOString();
      const stored: StoredProfile = {
        data: {
          fullName: shippingDetails.fullName,
          email: shippingDetails.email,
          phone: shippingDetails.phone,
          city: shippingDetails.city,
          postalCode: shippingDetails.postalCode,
          addressLine1: shippingDetails.addressLine1,
          apartment: shippingDetails.apartment,
          roadNo: shippingDetails.roadNo,
          additionalInfo: shippingDetails.additionalInfo,
        },
        updatedAt: timestamp,
      };

      setStoredProfile(currentUser.id, stored);
    }

    const now = new Date();
    const placedOn = now.toISOString();
    const estimatedDelivery = new Date(
      now.getTime() + ORDER_ESTIMATED_DELIVERY_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();
    const orderId = generateOrderId();

    const totalAmount = cart.items.reduce((total, item) => {
      return total + getCartItemFinalPrice(item) * item.quantity;
    }, 0);

    const addressLine2 = [
      shippingDetails.apartment,
      shippingDetails.roadNo,
    ]
      .filter((value) => value && value.trim().length > 0)
      .join(", ");

    const order: OrderTracking = {
      id: orderId,
      placedOn,
      totalAmount,
      itemsCount: cart.totalQuantities,
      status: "processing",
      paymentMethod:
        paymentMethods.find((method) => method.id === selectedPayment)?.title ??
        "Cash on Delivery",
      estimatedDelivery,
      notes: shippingDetails.additionalInfo,
      shippingAddress: {
        name: shippingDetails.fullName,
        phone: shippingDetails.phone,
        addressLine1: shippingDetails.addressLine1,
        addressLine2: addressLine2.length > 0 ? addressLine2 : undefined,
        city: shippingDetails.city,
        postalCode: shippingDetails.postalCode,
      },
      statusHistory: [
        {
          id: "placed",
          title: "Order Placed",
          description: "We have received your order details.",
          date: placedOn,
          isCompleted: true,
        },
        {
          id: "processing",
          title: "Processing",
          description: "We're preparing your items for dispatch.",
          date: placedOn,
          isCompleted: true,
        },
        {
          id: "shipped",
          title: "Shipped",
          description: "Your package will be handed over to the courier soon.",
          isCompleted: false,
        },
        {
          id: "out-for-delivery",
          title: "Out for Delivery",
          description: "The courier will contact you before arriving.",
          isCompleted: false,
        },
        {
          id: "delivered",
          title: "Delivered",
          description: "Enjoy your new styles from TSR Fashion!",
          isCompleted: false,
        },
      ],
    };

    if (typeof window !== "undefined") {
      try {
        const existing = window.localStorage.getItem(ORDER_STORAGE_KEY);
        const parsed: OrderTracking[] = existing ? JSON.parse(existing) : [];
        window.localStorage.setItem(
          ORDER_STORAGE_KEY,
          JSON.stringify([...parsed, order])
        );
      } catch (error) {
        console.error("Failed to persist order", error);
      }
    }

    dispatch(clearCart());
    toast.success(`Order confirmed! Tracking ID: ${orderId}`);
    setSelectedPayment("");
    router.push(`/order-tracking?orderId=${orderId}`);
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

  if (!isMounted) {
    return null;
  }

  if (authStatus === "loading") {
    return (
      <main className="pb-20">
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-lg font-semibold text-black">Preparing checkout…</p>
            <p className="mt-2 text-sm text-black/60">
              Please wait while we confirm your account details.
            </p>
            <div className="mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-black/10">
              <div className="h-full w-1/2 animate-pulse bg-black/40" />
            </div>
          </div>
        </div>
      </main>
    );
  }

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

        <section>
          {step === "address" && (
            <form
              className="grid gap-6 rounded-[24px] border border-black/10 bg-white p-6 md:p-10"
              onSubmit={handleSubmit(onSubmit)}
            >
              {isAuthenticated && currentUser ? (
                <div className="rounded-2xl border border-black/10 bg-[#F7F7F7] p-4 text-sm text-black/70">
                  Logged in as
                  <span className="font-semibold"> {currentUser.fullName}</span>
                  {" "}
                  ({currentUser.email}). Update your details below if anything
                  has changed.
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-black/15 bg-[#F7F7F7] p-4 text-sm text-black/70">
                  New here? Complete the form below to create your TSR Fashion
                  account while checking out.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor={fieldIds.fullName}
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Full name
                  </label>
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Input
                      placeholder="e.g. Rahim Uddin"
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
                        errors.email
                          ? `${fieldIds.email}-error`
                          : undefined
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
              </div>

              {authStatus === "guest" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        placeholder="Create a password"
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
                        placeholder="Re-enter password"
                        className="bg-transparent"
                        id={fieldIds.confirmPassword}
                        autoComplete="new-password"
                        aria-invalid={
                          errors.confirmPassword ? "true" : "false"
                        }
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
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor={fieldIds.phone}
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Phone number
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
                        errors.phone
                          ? `${fieldIds.phone}-error`
                          : undefined
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
                    htmlFor={fieldIds.postalCode}
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Postal code
                  </label>
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Input
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 1207"
                      className="bg-transparent"
                      id={fieldIds.postalCode}
                      autoComplete="postal-code"
                      aria-invalid={errors.postalCode ? "true" : "false"}
                      aria-describedby={
                        errors.postalCode
                          ? `${fieldIds.postalCode}-error`
                          : undefined
                      }
                      {...register("postalCode")}
                    />
                  </InputGroup>
                  {errors.postalCode && (
                    <p
                      id={`${fieldIds.postalCode}-error`}
                      className="mt-2 text-sm text-red-500"
                      role="alert"
                    >
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor={fieldIds.city}
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    City / District
                  </label>
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Input
                      placeholder="e.g. Dhaka"
                      className="bg-transparent"
                      id={fieldIds.city}
                      autoComplete="address-level2"
                      aria-invalid={errors.city ? "true" : "false"}
                      aria-describedby={
                        errors.city ? `${fieldIds.city}-error` : undefined
                      }
                      {...register("city")}
                    />
                  </InputGroup>
                  {errors.city && (
                    <p
                      id={`${fieldIds.city}-error`}
                      className="mt-2 text-sm text-red-500"
                      role="alert"
                    >
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor={fieldIds.addressLine1}
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Street address
                  </label>
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Input
                      placeholder="House, road number"
                      className="bg-transparent"
                      id={fieldIds.addressLine1}
                      autoComplete="street-address"
                      aria-invalid={errors.addressLine1 ? "true" : "false"}
                      aria-describedby={
                        errors.addressLine1
                          ? `${fieldIds.addressLine1}-error`
                          : undefined
                      }
                      {...register("addressLine1")}
                    />
                  </InputGroup>
                  {errors.addressLine1 && (
                    <p
                      id={`${fieldIds.addressLine1}-error`}
                      className="mt-2 text-sm text-red-500"
                      role="alert"
                    >
                      {errors.addressLine1.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor={fieldIds.apartment}
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Apartment / Floor (optional)
                  </label>
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Input
                      placeholder="Apartment, floor, block"
                      className="bg-transparent"
                      id={fieldIds.apartment}
                      autoComplete="address-line2"
                      {...register("apartment")}
                    />
                  </InputGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor={fieldIds.roadNo}
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Road number (optional)
                  </label>
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Input
                      placeholder="Road / holding number"
                      className="bg-transparent"
                      id={fieldIds.roadNo}
                      autoComplete="address-line2"
                      {...register("roadNo")}
                    />
                  </InputGroup>
                </div>
                <div>
                  <label
                    htmlFor={fieldIds.additionalInfo}
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Delivery notes (optional)
                  </label>
                  <div className="rounded-2xl border border-black/10 bg-[#F0F0F0] px-4 py-3">
                    <textarea
                      id={fieldIds.additionalInfo}
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
                        {shippingDetails.city} {shippingDetails.postalCode}
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
                        className={cn(
                          "rounded-2xl border p-5 text-left transition",
                          isActive
                            ? "border-black bg-black text-white"
                            : "border-black/15 bg-white text-black hover:border-black/40"
                        )}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        <span className="text-lg font-semibold">
                          {method.title}
                        </span>
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
                  onClick={handleConfirmOrder}
                  className="mt-6 w-full rounded-full bg-black py-3 text-base font-semibold text-white"
                >
                  Confirm order
                </Button>
              </section>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
