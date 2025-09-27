"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import InputGroup from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import {
  ORDER_STORAGE_KEY,
  OrderTracking,
  OrderTimelineStep,
  sampleOrders,
} from "@/lib/data/orders";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { FaCheckCircle } from "react-icons/fa";

const formatDate = (value?: string) => {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const formatStatus = (status: string) =>
  status
    .split("-")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const mergeOrders = (
  baseOrders: OrderTracking[],
  storedOrders: OrderTracking[]
) => {
  const map = new Map<string, OrderTracking>();
  [...baseOrders, ...storedOrders].forEach((order) => {
    map.set(order.id, order);
  });

  return Array.from(map.values()).sort((a, b) =>
    new Date(b.placedOn).getTime() - new Date(a.placedOn).getTime()
  );
};

const getStoredOrders = () => {
  if (typeof window === "undefined") {
    return [] as OrderTracking[];
  }

  const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);

  if (!raw) {
    return [] as OrderTracking[];
  }

  try {
    return JSON.parse(raw) as OrderTracking[];
  } catch (error) {
    console.error("Failed to parse stored orders", error);
    return [] as OrderTracking[];
  }
};

const StepIndicator = ({
  step,
  isLast,
}: {
  step: OrderTimelineStep;
  isLast: boolean;
}) => {
  return (
    <div className="relative flex items-start">
      <div className="mr-4 flex flex-col items-center">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold",
            step.isCompleted
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-black/15 bg-white text-black/70"
          )}
        >
          {step.isCompleted ? <FaCheckCircle /> : step.title[0]}
        </span>
        {!isLast && <div className="mt-1 h-full w-px flex-1 bg-black/10" />}
      </div>
      <div className="pb-6">
        <h4 className="text-base font-semibold text-black">{step.title}</h4>
        <p className="mt-1 text-sm text-black/60">{step.description}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-black/40">
          {formatDate(step.date)}
        </p>
      </div>
    </div>
  );
};

export default function OrderTrackingPage() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") ?? "";
  const [orderId, setOrderId] = useState(initialOrderId);
  const [orders, setOrders] = useState<OrderTracking[]>(sampleOrders);
  const [selectedOrder, setSelectedOrder] = useState<OrderTracking | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedOrders = getStoredOrders();
    setOrders(mergeOrders(sampleOrders, storedOrders));
  }, []);

  const handleLookup = useCallback(
    async (id: string) => {
      const trimmed = id.trim();
      if (trimmed.length === 0) {
        setSelectedOrder(null);
        setError("Enter a valid order ID to view its status.");
        return;
      }

      const nextOrder = orders.find(
        (orderItem) => orderItem.id.toLowerCase() === trimmed.toLowerCase()
      );

      if (!nextOrder) {
        try {
          const response = await fetch(
            `/api/orders/${encodeURIComponent(trimmed)}`
          );

          if (!response.ok) {
            if (response.status === 404) {
              setSelectedOrder(null);
              setError(`We could not find any order with the ID "${trimmed}".`);
              return;
            }

            const data = (await response.json().catch(() => null)) as
              | { message?: string }
              | null;
            setSelectedOrder(null);
            setError(
              data?.message ??
                "We couldn't check our records right now. Please try again."
            );
            return;
          }

          const data = (await response.json()) as { order: OrderTracking };
          setError(null);
          setOrders((previous) => mergeOrders(previous, [data.order]));
          setSelectedOrder(data.order);
          return;
        } catch (lookupError) {
          console.error("Failed to fetch order details", lookupError);
          setSelectedOrder(null);
          setError(
            "We couldn't check our records right now. Please try again."
          );
          return;
        }
      } else {
        setError(null);
        setSelectedOrder(nextOrder);
        return;
      }
    },
    [orders]
  );

  useEffect(() => {
    if (initialOrderId) {
      void handleLookup(initialOrderId);
    }
  }, [handleLookup, initialOrderId]);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleLookup(orderId);
  };

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <section className="py-10 sm:py-14">
          <h1
            className={cn(
              integralCF.className,
              "text-3xl sm:text-[40px] font-bold uppercase text-black"
            )}
          >
            Track your order
          </h1>
          <p className="mt-3 max-w-3xl text-base text-black/60">
            Enter the tracking ID from your confirmation email. You can also
            review your most recent purchases below.
          </p>
          <form
            onSubmit={onSubmit}
            className="mt-6 flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3"
          >
            <InputGroup className="bg-[#F0F0F0] max-w-2xl">
              <InputGroup.Input
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder="e.g. TSR-105284"
                className="bg-transparent uppercase placeholder:text-black/40"
              />
            </InputGroup>
            <Button
              type="submit"
              className="h-[52px] rounded-full bg-black px-8 text-base font-semibold text-white"
            >
              Check status
            </Button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-red-500">{error}</p>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-6">
            {selectedOrder ? (
              <article className="rounded-[24px] border border-black/10 bg-white p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-black/40">
                      Order ID
                    </p>
                    <h2 className="text-2xl font-semibold text-black">
                      {selectedOrder.id}
                    </h2>
                  </div>
                  <div className="text-sm text-black/60">
                    Placed on {formatDate(selectedOrder.placedOn)}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#F7F7F7] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
                      Current status
                    </p>
                    <p className="mt-1 text-base font-semibold text-black">
                      {formatStatus(selectedOrder.status)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F7F7F7] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
                      Items
                    </p>
                    <p className="mt-1 text-base font-semibold text-black">
                      {selectedOrder.itemsCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F7F7F7] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
                      Total paid
                    </p>
                    <p className="mt-1 text-base font-semibold text-black">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-black">
                    Delivery timeline
                  </h3>
                  <div className="mt-4 space-y-2">
                    {selectedOrder.statusHistory.map((step, index, array) => (
                      <StepIndicator
                        key={step.id}
                        step={step}
                        isLast={index === array.length - 1}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-[#F7F7F7] p-4">
                    <h3 className="text-base font-semibold text-black">
                      Shipping address
                    </h3>
                    <p className="mt-2 text-sm text-black/70">
                      {selectedOrder.shippingAddress.name}
                    </p>
                    <p className="text-sm text-black/70">
                      {selectedOrder.shippingAddress.addressLine1}
                    </p>
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <p className="text-sm text-black/70">
                        {selectedOrder.shippingAddress.addressLine2}
                      </p>
                    )}
                    <p className="text-sm text-black/70">
                      {selectedOrder.shippingAddress.city}
                      {" "}
                      {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p className="mt-2 text-sm text-black/70">
                      {selectedOrder.shippingAddress.phone}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-[#F7F7F7] p-4">
                    <h3 className="text-base font-semibold text-black">
                      Payment details
                    </h3>
                    <p className="mt-2 text-sm text-black/70">
                      Method: {selectedOrder.paymentMethod}
                    </p>
                    {selectedOrder.estimatedDelivery && (
                      <p className="text-sm text-black/70">
                        Estimated delivery: {formatDate(selectedOrder.estimatedDelivery)}
                      </p>
                    )}
                    {selectedOrder.notes && (
                      <p className="mt-2 text-sm text-black/60">
                        Note: {selectedOrder.notes}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ) : (
              <article className="rounded-[24px] border border-dashed border-black/20 bg-white/70 p-6 sm:p-8 text-center">
                <h2 className="text-2xl font-semibold text-black">
                  Enter an order ID to begin
                </h2>
                <p className="mt-2 text-sm text-black/60">
                  The full history for your delivery will appear here once we
                  find a match.
                </p>
              </article>
            )}
          </div>

          <aside className="space-y-4 rounded-[24px] border border-black/10 bg-[#F7F7F7] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-black">Recent orders</h2>
            <ul className="space-y-3">
              {recentOrders.map((orderItem) => (
                <li
                  key={orderItem.id}
                  className="rounded-2xl border border-black/10 bg-white p-4"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOrderId(orderItem.id);
                      handleLookup(orderItem.id);
                    }}
                    className="flex w-full flex-col items-start text-left"
                  >
                    <span className="text-sm font-semibold text-black">
                      {orderItem.id}
                    </span>
                    <span className="text-xs text-black/50">
                      {formatDate(orderItem.placedOn)} · {formatStatus(orderItem.status)}
                    </span>
                    <span className="mt-1 text-sm font-medium text-black">
                      {formatCurrency(orderItem.totalAmount)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-black/50">
              Only orders placed on this device appear here. For help locating a
              different order, contact support@tsrfashion.com.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
