"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRoles } from "@/lib/mock/permissions";
import { isEmailTaken } from "@/lib/mock/users";
import type { AdminUser, UserFormData, UserStatus } from "@/lib/types/entity";

const ROLES = getRoles();

const STATUSES: { label: string; value: UserStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Invited", value: "invited" },
  { label: "Suspended", value: "suspended" },
];

type UserFormProps = {
  user?: AdminUser;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
};

function getInitialValues(user?: AdminUser): UserFormData {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    roleId: user?.roleId ?? "viewer",
    status: user?.status ?? "invited",
  };
}

export function UserForm({
  user,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: UserFormProps) {
  const [values, setValues] = useState(() => getInitialValues(user));
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  function validate(): boolean {
    const next: Partial<Record<keyof UserFormData, string>> = {};

    if (!values.name.trim()) {
      next.name = "Name is required";
    }

    if (!values.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Enter a valid email address";
    } else if (isEmailTaken(values.email, user?.id)) {
      next.email = "This email is already in use";
    }

    if (!values.roleId) {
      next.roleId = "Role is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  }

  function updateField<K extends keyof UserFormData>(name: K, value: UserFormData[K]) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  const isSuperAdmin = user?.roleId === "super-admin";

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Full name"
            autoComplete="name"
          />
          {errors.name ? (
            <p className="text-destructive text-xs">{errors.name}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="name@company.com"
            autoComplete="email"
          />
          {errors.email ? (
            <p className="text-destructive text-xs">{errors.email}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+1 555 0100"
            autoComplete="tel"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="role">
            Role <span className="text-destructive">*</span>
          </Label>
          {isSuperAdmin ? (
            <>
              <Input id="role" value="Super Admin" disabled />
              <p className="text-muted-foreground text-xs">
                Super Admin role cannot be changed.
              </p>
            </>
          ) : (
            <Select
              value={values.roleId}
              onValueChange={(v) => updateField("roleId", v ?? "viewer")}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectPopup>
                {ROLES.filter((role) => role.id !== "super-admin").map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          )}
          {errors.roleId ? (
            <p className="text-destructive text-xs">{errors.roleId}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={values.status}
            onValueChange={(v) => updateField("status", (v as UserStatus) ?? "invited")}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectPopup>
              {STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>
      </div>

      <div className="sticky bottom-0 mt-8 flex items-center justify-end gap-2 border-t border-border/60 bg-background py-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
