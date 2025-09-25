"use client";

import { ToastContainer, type ToastContainerProps } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMediaQuery } from "usehooks-ts";

import { cn } from "@/lib/utils";

const MOBILE_QUERY = "(max-width: 767px)";

export const Toaster = ({
  position,
  toastClassName,
  bodyClassName,
  hideProgressBar,
  theme,
  ...props
}: ToastContainerProps) => {
  const isMobile = useMediaQuery(MOBILE_QUERY);

  const resolvedPosition = position ?? (isMobile ? "top-center" : "bottom-right");

  return (
    <ToastContainer
      position={resolvedPosition}
      hideProgressBar={hideProgressBar ?? true}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      newestOnTop={false}
      theme={theme ?? "light"}
      toastClassName={cn(
        "!bg-white !border !border-zinc-200 !shadow-lg !rounded-xl !px-4 !py-3 !text-sm !text-zinc-900",
        toastClassName
      )}
      bodyClassName={cn("!text-zinc-500", bodyClassName)}
      {...props}
    />
  );
};

export default Toaster;
