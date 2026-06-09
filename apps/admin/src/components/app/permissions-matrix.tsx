"use client";

import { CheckIcon, MinusIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApiError } from "@/lib/api/client";
import { buildGrantMap, isGranted } from "@/lib/api/permissions";
import { usePermissionMatrix, useUpsertGrant } from "@/lib/hooks/use-permissions";
import { useRoles } from "@/lib/hooks/use-roles";
import { toast } from "@/lib/toast";

export function PermissionsMatrix() {
  const { data: matrix, isLoading, isError, refetch } = usePermissionMatrix();
  const { data: roleRecords = [] } = useRoles();
  const upsertGrant = useUpsertGrant();
  const [activeRoleName, setActiveRoleName] = useState<string>("");
  const [query, setQuery] = useState("");

  const roleName = activeRoleName || matrix?.roles[0] || "";
  const activeRole = roleRecords.find((r) => r.name === roleName);

  const grantMap = useMemo(
    () => buildGrantMap(matrix?.grants ?? []),
    [matrix?.grants],
  );

  const filteredEntities = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (matrix?.entities ?? []).filter((entity) =>
      q ? entity.name.toLowerCase().includes(q) : true,
    );
  }, [matrix?.entities, query]);

  const allowedCount = useMemo(() => {
    if (!matrix || !roleName) return 0;
    let count = 0;
    for (const entity of matrix.entities) {
      for (const action of entity.actions) {
        if (isGranted(grantMap, roleName, entity.name, action)) count += 1;
      }
    }
    return count;
  }, [grantMap, matrix, roleName]);

  async function toggleGrant(entity: string, action: string) {
    if (!activeRole) return;
    const currentlyAllowed = isGranted(grantMap, roleName, entity, action);
    try {
      await upsertGrant.mutateAsync({
        roleId: activeRole.id,
        entity,
        action,
        allowed: !currentlyAllowed,
      });
    } catch (error) {
      toast.error("Failed to update grant", {
        description: error instanceof ApiError ? error.message : undefined,
      });
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading permission matrix…</p>;
  }

  if (isError || !matrix) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">Failed to load permissions.</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="gap-5 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-2">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
          Roles
        </div>
        <ul className="flex flex-col gap-2">
          {matrix.roles.map((name) => {
            const record = roleRecords.find((r) => r.name === name);
            return (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => setActiveRoleName(name)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    name === roleName
                      ? "border-foreground/30 bg-foreground/[0.04]"
                      : "border-border/60 hover:border-foreground/20"
                  }`}
                >
                  <div className="font-medium text-sm">{record?.label ?? name}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {name}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <Separator className="my-3" />
        <p className="text-muted-foreground text-xs">
          Grants are stored on the server. Admin role required to edit.
        </p>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="top-1/2 left-2.5 absolute size-4 text-muted-foreground -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter entities…"
              className="bg-background py-2 pr-3 pl-9 border border-border/60 rounded-lg outline-none w-full text-sm focus:border-foreground/40"
            />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            {allowedCount} grants for {activeRole?.label ?? roleName}
          </span>
        </div>

        <div className="overflow-x-auto border border-border/60 rounded-xl">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-foreground/[0.02]">
                <th className="px-4 py-3 text-left font-medium">Entity</th>
                {(matrix.entities[0]?.actions ?? []).map((action) => (
                  <th key={action} className="px-3 py-3 font-mono text-[10px] text-muted-foreground uppercase tracking-wider text-center">
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEntities.map((entity) => (
                <tr key={entity.name} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-medium">{entity.name}</td>
                  {entity.actions.map((action) => {
                    const allowed = isGranted(grantMap, roleName, entity.name, action);
                    return (
                      <td key={action} className="px-3 py-3 text-center">
                        <button
                          type="button"
                          disabled={!activeRole || upsertGrant.isPending}
                          onClick={() => toggleGrant(entity.name, action)}
                          className={`inline-flex size-8 items-center justify-center rounded-md border transition-colors ${
                            allowed
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "border-border/60 text-muted-foreground hover:border-foreground/30"
                          }`}
                          aria-label={`${allowed ? "Revoke" : "Grant"} ${action} on ${entity.name}`}
                        >
                          {allowed ? <CheckIcon className="size-3.5" /> : <MinusIcon className="size-3.5 opacity-40" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
