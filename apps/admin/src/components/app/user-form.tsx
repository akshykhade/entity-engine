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
import { roleSelectItems } from "@/lib/api/roles";
import { useRoles } from "@/lib/hooks/use-roles";
import { checkEmailTaken } from "@/lib/api/users";
import type { AdminUser, UserFormData, UserStatus } from "@/lib/types/entity";

const STATUSES: { label: string; value: UserStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Invited", value: "invited" },
  { label: "Suspended", value: "suspended" },
];

type UserFormProps = {
  user?: AdminUser;
  onSubmit: (data: UserFormData) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
};

function getInitialValues(user: AdminUser | undefined, defaultRoleId: string): UserFormData {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    roleId: user?.roleId ?? defaultRoleId,
    status: user?.status ?? "invited",
  };
}

export function UserForm({
  user,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: UserFormProps) {
  const { data: roles = [] } = useRoles();
  const roleItems = roleSelectItems(roles);
  const defaultRoleId = roles.find((r) => r.name === "public")?.id ?? roles[0]?.id ?? "";
  const [values, setValues] = useState(() => getInitialValues(user, defaultRoleId));
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  async function validate(): Promise<boolean> {
    const next: Partial<Record<keyof UserFormData, string>> = {};

    if (!values.name.trim()) {
      next.name = "Name is required";
    }

    if (!values.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Enter a valid email address";
    } else {
      try {
        const taken = await checkEmailTaken(values.email, user?.id);
        if (taken) next.email = "This email is already in use";
      } catch {
        // ignore check failures during validation
      }
    }

    if (!values.roleId) {
      next.roleId = "Role is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!(await validate())) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-8">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? <p className="text-destructive text-xs">{errors.name}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <p className="text-destructive text-xs">{errors.email}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          placeholder="Optional"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Role</Label>
        <Select
          value={values.roleId}
          onValueChange={(roleId) => setValues((v) => ({ ...v, roleId: roleId ?? "" }))}
          items={roleItems}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectPopup>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.label ?? role.name}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
        {errors.roleId ? <p className="text-destructive text-xs">{errors.roleId}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Status</Label>
        <Select
          value={values.status}
          onValueChange={(status) =>
            setValues((v) => ({ ...v, status: (status as UserStatus) ?? "invited" }))
          }
          items={STATUSES}
        >
          <SelectTrigger>
            <SelectValue />
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

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
