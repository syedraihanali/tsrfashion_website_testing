"use client";

import { Toaster as SonnerToaster } from "sonner";
import type { ComponentProps } from "react";

type ToasterProps = ComponentProps<typeof SonnerToaster>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      theme="light"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-white border border-zinc-200 shadow-lg rounded-xl px-4 py-3 text-sm text-zinc-900",
          description: "text-zinc-500",
          actionButton:
            "bg-black text-white rounded-full px-3 py-1 text-sm font-medium hover:bg-black/80",
          cancelButton:
            "bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100",
        },
      }}
      {...props}
    />
  );
};

export default Toaster;
