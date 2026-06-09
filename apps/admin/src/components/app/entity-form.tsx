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
import { Textarea } from "@/components/ui/textarea";
import type { EntityMeta, EntityRecord } from "@/lib/types/entity";

type EntityFormProps = {
  entity: EntityMeta;
  record?: EntityRecord;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  submitLabel?: string;
};

function getInitialValues(
  entity: EntityMeta,
  record?: EntityRecord,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [name, field] of Object.entries(entity.fields)) {
    const raw = record?.[name];
    values[name] =
      raw === undefined || raw === null
        ? ""
        : field.storageType === "number"
          ? String(raw)
          : String(raw);
  }
  return values;
}

export function EntityForm({
  entity,
  record,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: EntityFormProps) {
  const [values, setValues] = useState(() => getInitialValues(entity, record));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const [name, field] of Object.entries(entity.fields)) {
      if (field.required && !values[name]?.trim()) {
        next[name] = `${field.label} is required`;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const data: Record<string, unknown> = {};
    for (const [name, field] of Object.entries(entity.fields)) {
      const raw = values[name];
      if (field.storageType === "number") {
        data[name] = raw ? Number(raw) : 0;
      } else {
        data[name] = raw;
      }
    }
    onSubmit(data);
  }

  function updateField(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {Object.entries(entity.fields).map(([name, field]) => (
          <div key={name} className="grid gap-2">
            <Label htmlFor={name}>
              {field.label}
              {field.required ? <span className="text-destructive"> *</span> : null}
            </Label>
            {field.uiType === "select" && field.options ? (
              <Select
                value={values[name]}
                onValueChange={(v) => updateField(name, v ?? "")}
              >
                <SelectTrigger id={name}>
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectPopup>
                  {field.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            ) : field.uiType === "textarea" ? (
              <Textarea
                id={name}
                value={values[name]}
                onChange={(e) => updateField(name, e.target.value)}
                rows={3}
              />
            ) : (
              <Input
                id={name}
                type={
                  field.uiType === "email"
                    ? "email"
                    : field.uiType === "number"
                      ? "number"
                      : field.uiType === "phone"
                        ? "tel"
                        : "text"
                }
                value={values[name]}
                onChange={(e) => updateField(name, e.target.value)}
              />
            )}
            {errors[name] ? (
              <p className="text-destructive text-xs">{errors[name]}</p>
            ) : null}
          </div>
        ))}
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
