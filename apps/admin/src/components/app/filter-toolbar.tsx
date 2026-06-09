"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EntityMeta } from "@/lib/types/entity";

export type FilterChip = {
  key: string;
  label: string;
  value: string;
};

type FilterToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSortChange: (field: string, direction: "asc" | "desc") => void;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  entity: EntityMeta;
};

const INVOICE_STATUSES = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Void", value: "void" },
];

const EMAIL_DOMAINS = [
  { label: "All domains", value: "all" },
  { label: "acme.dev", value: "acme.dev" },
  { label: "com", value: "com" },
  { label: "io", value: "io" },
];

export function FilterToolbar({
  search,
  onSearchChange,
  sortField,
  sortDirection,
  onSortChange,
  filters,
  onFilterChange,
  onClearFilters,
  entity,
}: FilterToolbarProps) {
  const sortableFields = Object.entries(entity.fields)
    .filter(([, f]) => f.sortable)
    .map(([name, f]) => ({ name, label: f.label }));

  const activeChips: FilterChip[] = [];
  if (filters.status && filters.status !== "all") {
    activeChips.push({ key: "status", label: "Status", value: filters.status });
  }
  if (filters.emailDomain && filters.emailDomain !== "all") {
    activeChips.push({
      key: "emailDomain",
      label: "Email domain",
      value: filters.emailDomain,
    });
  }

  const hasActiveFilters = activeChips.length > 0 || search.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 border-b p-3">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="max-w-xs flex-1">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={`Search ${entity.name.toLowerCase()}…`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>

        {entity.slug === "invoice" ? (
          <Select
            value={filters.status ?? "all"}
            onValueChange={(v) => onFilterChange("status", v ?? "all")}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectPopup>
              {INVOICE_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        ) : null}

        {entity.slug === "customer" ? (
          <Select
            value={filters.emailDomain ?? "all"}
            onValueChange={(v) => onFilterChange("emailDomain", v ?? "all")}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Email domain" />
            </SelectTrigger>
            <SelectPopup>
              {EMAIL_DOMAINS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        ) : null}

        {sortableFields.length > 0 ? (
          <Select
            value={`${sortField}:${sortDirection}`}
            onValueChange={(v) => {
              if (!v) return;
              const [field, direction] = v.split(":");
              if (!field || !direction) return;
              onSortChange(field, direction as "asc" | "desc");
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectPopup>
              {sortableFields.flatMap((f) => [
                <SelectItem key={`${f.name}:asc`} value={`${f.name}:asc`}>
                  {f.label} ↑
                </SelectItem>,
                <SelectItem key={`${f.name}:desc`} value={`${f.name}:desc`}>
                  {f.label} ↓
                </SelectItem>,
              ])}
              <SelectItem value="createdAt:desc">Created ↓</SelectItem>
              <SelectItem value="createdAt:asc">Created ↑</SelectItem>
            </SelectPopup>
          </Select>
        ) : null}
      </div>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {search.trim() ? (
            <Badge variant="outline" className="gap-1">
              Search: {search}
              <button
                type="button"
                className="opacity-60 hover:opacity-100"
                onClick={() => onSearchChange("")}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ) : null}
          {activeChips.map((chip) => (
            <Badge key={chip.key} variant="outline" className="gap-1">
              {chip.label}: {chip.value}
              <button
                type="button"
                className="opacity-60 hover:opacity-100"
                onClick={() => onFilterChange(chip.key, "all")}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          <Button size="xs" variant="ghost" className="text-muted-foreground" onClick={onClearFilters}>
            <XIcon />
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  );
}
