"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  actionInitialState,
  createAdminAction,
  type AdminActionState,
} from "@/app/admin/(dashboard)/settings/admins/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Add admin"}
    </Button>
  );
}

export function AddAdminForm() {
  const [state, formAction] = useFormState<
    AdminActionState,
    FormData
  >(createAdminAction, actionInitialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="admin-email">Admin email</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          placeholder="operations@tsrfashion.com"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="admin-password">Temporary password</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          required
        />
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton />
        {state.status !== "idle" && (
          <p
            className={`text-sm ${
              state.status === "success" ? "text-emerald-600" : "text-destructive"
            }`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
