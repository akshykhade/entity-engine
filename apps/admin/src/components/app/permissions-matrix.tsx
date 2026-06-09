"use client";

import {
  CheckIcon,
  LockIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  countAllowedForRole,
  createInitialPermissionState,
  getActionsForRole,
  getEntitiesForRole,
  getRoles,
  togglePermissionGrant,
  type ActionColumn,
  type CellState,
  type PermissionState,
  type RoleDef,
  type RoleId,
} from "@/lib/mock/permissions";

export function PermissionsMatrix() {
  const roles = getRoles();
  const [permissionState, setPermissionState] = useState<PermissionState>(createInitialPermissionState);
  const [activeRole, setActiveRole] = useState<RoleId>("editor");
  const [query, setQuery] = useState("");

  const activeRoleDef = roles.find((role) => role.id === activeRole)!;
  const actionColumns = useMemo(
    () => getActionsForRole(activeRole, permissionState),
    [activeRole, permissionState],
  );
  const allowedCount = useMemo(
    () => countAllowedForRole(activeRole, permissionState),
    [activeRole, permissionState],
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return getEntitiesForRole(activeRole, permissionState).filter((row) =>
      q ? row.entityName.toLowerCase().includes(q) : true,
    );
  }, [activeRole, permissionState, query]);

  function toggleCell(entitySlug: string, action: string) {
    setPermissionState((current) =>
      togglePermissionGrant(current, activeRole, entitySlug, action),
    );
  }

  return (
    <div className="gap-5 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-2">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          Roles
        </div>
        <ul className="flex flex-col gap-2">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              active={role.id === activeRole}
              onSelect={() => setActiveRole(role.id)}
            />
          ))}
        </ul>

        <Separator className="my-3" />

        <Button variant="outline" size="sm" className="justify-start" disabled>
          <PlusIcon />
          Create custom role
        </Button>
        <p className="text-muted-foreground text-xs">
          Select a role, then click cells to enable or disable grants.
        </p>
      </aside>

      <section className="min-w-0">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3">
          <div className="flex flex-1 items-center gap-2 bg-background/40 px-3 border border-border/70 rounded-md">
            <SearchIcon className="opacity-50 size-3.5" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter entities…"
              className="flex-1 bg-transparent outline-none h-9 placeholder:text-muted-foreground text-sm"
            />
            {query ? (
              <span className="font-mono tabular-nums text-[10px] text-muted-foreground">
                {filteredRows.length} shown
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 bg-background/40 px-3 py-2 border border-border/60 rounded-md">
            <span
              className={`inline-flex size-5 items-center justify-center rounded ${activeRoleDef.tone}`}
            >
              <ShieldIcon className="size-3" />
            </span>
            <div>
              <div className="font-medium text-sm">{activeRoleDef.name}</div>
              <div className="font-mono tabular-nums text-[10px] text-muted-foreground">
                {allowedCount} allowed · {actionColumns.length} operations
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background/40 mt-4 border border-border/60 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="top-0 z-10 sticky bg-background/95 backdrop-blur">
                <tr className="border-border/60 border-b">
                  <th
                    scope="col"
                    className="left-0 z-20 sticky bg-background/95 px-4 py-3 min-w-[140px] font-mono text-[10px] text-muted-foreground text-left uppercase tracking-[0.25em]"
                  >
                    Entity
                  </th>
                  {actionColumns.map((column) => (
                    <ActionHeader key={column.action} column={column} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, rowIndex) => (
                  <tr
                    key={row.entitySlug}
                    className={`transition-colors odd:bg-foreground/[0.012] hover:bg-foreground/[0.04] ${
                      rowIndex === filteredRows.length - 1 ? "" : "border-b border-border/30"
                    }`}
                  >
                    <td className="left-0 z-10 sticky bg-inherit px-4 py-3 min-w-[140px]">
                      <span className="font-medium text-[13px]">{row.entityName}</span>
                      <span className="block mt-0.5 font-mono text-[10px] text-muted-foreground/80">
                        {row.entitySlug}
                      </span>
                    </td>
                    {actionColumns.map((column) => {
                      const state = row.cells[column.action] ?? "na";
                      return (
                        <td
                          key={column.action}
                          className="px-2 py-3 border-border/30 border-l text-center"
                        >
                          <PermCell
                            state={state}
                            label={`${row.entityName} ${column.label}`}
                            onToggle={
                              state === "na"
                                ? undefined
                                : () => toggleCell(row.entitySlug, column.action)
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={actionColumns.length + 1}
                      className="px-4 py-12 text-muted-foreground text-sm text-center"
                    >
                      No entities match &ldquo;{query}&rdquo;.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <Separator />
          <div className="flex flex-wrap items-center gap-4 px-4 py-2.5">
            <LegendItem state="yes" label="Enabled" />
            <LegendItem state="no" label="Disabled" />
            <LegendItem state="na" label="N/A" />
            <span className="ml-auto font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Editing{" "}
              <span className="text-foreground">{activeRoleDef.name}</span> · click to toggle
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionHeader({ column }: { column: ActionColumn }) {
  return (
    <th
      scope="col"
      className="px-2 py-3 border-border/40 border-l min-w-[72px] text-center"
    >
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
        {column.label}
      </span>
    </th>
  );
}

function RoleCard({
  role,
  active,
  onSelect,
}: {
  role: RoleDef;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`group w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
          active
            ? "border-foreground/30 bg-foreground/[0.04]"
            : "border-border/60 bg-background/40 hover:border-foreground/20 hover:bg-foreground/[0.02]"
        }`}
      >
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex size-5 items-center justify-center rounded ${role.tone}`}
            >
              <ShieldIcon className="size-3" />
            </span>
            <span className="font-medium text-sm">{role.name}</span>
          </div>
          <span className="bg-foreground/[0.06] px-1.5 py-0.5 rounded font-mono tabular-nums text-[9px] text-muted-foreground">
            {role.members}
          </span>
        </div>
        <p className="mt-1 text-muted-foreground text-xs line-clamp-2">{role.description}</p>
        {role.system ? (
          <span className="inline-block mt-1.5 font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
            System role
          </span>
        ) : null}
      </button>
    </li>
  );
}

function PermCell({
  state,
  label,
  onToggle,
}: {
  state: CellState;
  label: string;
  onToggle?: () => void;
}) {
  if (onToggle) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${label}: ${state === "yes" ? "enabled" : "disabled"}. Click to toggle.`}
        aria-pressed={state === "yes"}
        title={state === "yes" ? "Enabled — click to disable" : "Disabled — click to enable"}
        className={`cursor-pointer inline-flex size-7 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          state === "yes"
            ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400"
            : "text-muted-foreground/50 hover:bg-foreground/[0.06] hover:text-muted-foreground"
        }`}
      >
        {state === "yes" ? (
          <CheckIcon className="size-3.5" strokeWidth={3} />
        ) : (
          <MinusIcon className="size-3.5" />
        )}
      </button>
    );
  }

  if (state === "yes") {
    return (
      <span
        className="inline-flex justify-center items-center bg-emerald-500/15 rounded-full size-5 text-emerald-600 dark:text-emerald-400"
        aria-label="Enabled"
      >
        <CheckIcon className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (state === "na") {
    return (
      <span
        className="inline-flex justify-center items-center bg-foreground/[0.04] rounded-full size-5 text-muted-foreground/60"
        aria-label="Not applicable"
        title="Not applicable for this entity"
      >
        <LockIcon className="size-2.5" />
      </span>
    );
  }
  return (
    <span
      className="inline-flex justify-center items-center size-5 text-muted-foreground/40"
      aria-label="Disabled"
    >
      <MinusIcon className="size-3.5" />
    </span>
  );
}

function LegendItem({ state, label }: { state: CellState; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <PermCell state={state} label={label} />
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  );
}
