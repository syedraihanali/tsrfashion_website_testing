"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  actionInitialState,
  deleteAdminAction,
  type AdminActionState,
} from "@/app/admin/(dashboard)/settings/admins/actions";

export function DeleteAdminForm({
  adminId,
  disabled,
}: {
  adminId: string;
  disabled?: boolean;
}) {
  const deleteAction = deleteAdminAction;
  const [state, formAction] = useFormState<AdminActionState, FormData>(
    deleteAction,
    actionInitialState
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="adminId" value={adminId} />
      <DeleteButton disabled={disabled} />
      {state.status !== "idle" && (
        <span
          className={`text-xs ${
            state.status === "success" ? "text-emerald-600" : "text-destructive"
          }`}
        >
          {state.message}
        </span>
      )}
    </form>
  );
}

function DeleteButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={disabled || pending}
    >
      {pending ? "Removing..." : "Remove"}
    </Button>
  );
}
