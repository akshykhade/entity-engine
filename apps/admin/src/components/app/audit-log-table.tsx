"use client";

import { format } from "date-fns";
import { PlusIcon, ShieldIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLog } from "@/lib/hooks/use-audit-log";
import { useEntityCatalog } from "@/lib/hooks/use-entities";
import { useUsers } from "@/lib/hooks/use-users";
import type { AuditAction } from "@/lib/types/entity";

const ACTIONS: { label: string; value: string }[] = [
  { label: "All actions", value: "all" },
  { label: "Create", value: "create" },
  { label: "Update", value: "update" },
  { label: "Delete", value: "delete" },
];

const PAGE_SIZE = 10;

const ACTION_BADGE: Record<AuditAction, string> = {
  create: "border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
  update: "border-amber-500/30 text-amber-700 dark:text-amber-400",
  delete: "border-destructive/30 text-destructive",
};

function summarizeChanges(before: string | null, after: string | null): string {
  if (before && after) {
    try {
      const b = JSON.parse(before) as Record<string, unknown>;
      const a = JSON.parse(after) as Record<string, unknown>;
      const keys = new Set([...Object.keys(b), ...Object.keys(a)]);
      const changed = [...keys].filter((k) => JSON.stringify(b[k]) !== JSON.stringify(a[k]));
      return changed.length ? `Changed: ${changed.join(", ")}` : "No field changes";
    } catch {
      return "Updated record";
    }
  }
  if (after) return "Record created";
  if (before) return "Record deleted";
  return "—";
}

function getVisiblePages(current: number, total: number): number[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - 2);
  const end = Math.min(total, start + 4);
  start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

type AuditLogTableProps = {
  onSummaryChange?: (summary: string) => void;
};

export function AuditLogTable({ onSummaryChange }: AuditLogTableProps = {}) {
  const { data: usersData } = useUsers();
  const users = usersData?.users ?? [];
  const { data: entities = [] } = useEntityCatalog();

  const [entity, setEntity] = useState("all");
  const [actorId, setActorId] = useState("all");
  const [action, setAction] = useState("all");
  const [page, setPage] = useState(1);

  const selectedEntityName =
    entity === "all" ? undefined : entities.find((e) => e.slug === entity)?.name ?? entity;

  const { data, isLoading, isError, refetch } = useAuditLog({
    entity: selectedEntityName,
    actorId: actorId === "all" ? undefined : actorId,
    action: action === "all" ? undefined : (action as AuditAction),
    page,
    pageSize: PAGE_SIZE,
  });

  const entries = data?.entries ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const start = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalCount);
  const paginatedEntries = entries;
  const visiblePages = getVisiblePages(page, totalPages);
  const firstVisiblePage = visiblePages[0] ?? 1;
  const lastVisiblePage = visiblePages[visiblePages.length - 1] ?? totalPages;

  useEffect(() => {
    setPage(1);
  }, [entity, actorId, action]);

  useEffect(() => {
    if (!onSummaryChange) return;
    onSummaryChange(
      totalCount === 0
        ? "No entries"
        : `Showing ${start}–${end} of ${totalCount}`,
    );
  }, [onSummaryChange, start, end, totalCount]);

  const activeChips = [
    entity !== "all"
      ? { label: "Entity", value: entities.find((e) => e.slug === entity)?.name ?? entity }
      : null,
    actorId !== "all"
      ? { label: "User", value: users.find((u) => u.id === actorId)?.name ?? actorId }
      : null,
    action !== "all" ? { label: "Action", value: action } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const actorMap = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );

  function clearAll() {
    setEntity("all");
    setActorId("all");
    setAction("all");
  }

  return (
    <div className="bg-card shadow-xs/5 border rounded-xl">
      <div className="flex flex-col gap-3 p-3 border-b">
        <div className="flex flex-wrap items-end gap-3">
          <div className="gap-2 grid">
            <Label htmlFor="audit-filter-user">User</Label>
            <Select value={actorId} onValueChange={(v) => setActorId(v ?? "all")}>
              <SelectTrigger id="audit-filter-user" className="w-44">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectPopup>
                <SelectItem value="all">All users</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </div>

          <div className="gap-2 grid">
            <Label htmlFor="audit-filter-entity">Entity</Label>
            <Select value={entity} onValueChange={(v) => setEntity(v ?? "all")}>
              <SelectTrigger id="audit-filter-entity" className="w-40">
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectPopup>
                <SelectItem value="all">All entities</SelectItem>
                {entities.map((e) => (
                  <SelectItem key={e.slug} value={e.slug}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </div>

          <div className="gap-2 grid">
            <Label htmlFor="audit-filter-action">Action</Label>
            <Select value={action} onValueChange={(v) => setAction(v ?? "all")}>
              <SelectTrigger id="audit-filter-action" className="w-36">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectPopup>
                {ACTIONS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </div>

        </div>

        {activeChips.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Filters
            </span>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex flex-wrap flex-1 items-center gap-1.5">
              {activeChips.map((chip) => (
                <Badge key={chip.label} variant="outline" className="gap-1">
                  {chip.label}: {chip.value}
                </Badge>
              ))}
              <Button size="xs" variant="ghost" className="border-dashed">
                <PlusIcon />
                Add
              </Button>
            </div>
            <Button size="xs" variant="ghost" className="text-muted-foreground" onClick={clearAll}>
              <XIcon />
              Clear all
            </Button>
          </div>
        ) : null}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="ps-4 w-40">Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Record</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="pe-4">Summary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-muted-foreground text-center">
                Loading audit log…
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center">
                <p className="text-muted-foreground">Failed to load audit log.</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => refetch()}>
                  Retry
                </Button>
              </TableCell>
            </TableRow>
          ) : entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-muted-foreground text-center">
                No audit entries match your filters.
              </TableCell>
            </TableRow>
          ) : (
            paginatedEntries.map((entry) => {
              const actor = actorMap.get(entry.actorId);
              const entityMeta = entities.find(
                (e) => e.slug === entry.entity || e.name === entry.entity,
              );
              return (
                <TableRow key={entry.id}>
                  <TableCell className="ps-4 font-mono tabular-nums text-xs">
                    {format(entry.createdAt, "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">
                          {actor?.initials ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{actor?.name ?? "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <ShieldIcon className="size-3.5 text-muted-foreground" />
                      <span className="text-sm">{entityMeta?.name ?? entry.entity}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/entities/${entry.entity}/${entry.recordId}`}
                      className="font-mono text-primary text-xs hover:underline"
                    >
                      {entry.recordId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      size="default"
                      className={ACTION_BADGE[entry.action]}
                    >
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="pe-4 max-w-xs text-muted-foreground text-xs truncate">
                    {summarizeChanges(entry.before, entry.after)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {totalCount > 0 ? (
        <div className="flex justify-between items-center p-3 border-t">
          <span className="text-muted-foreground text-xs">
            Showing{" "}
            <span className="tabular-nums text-foreground">
              {start}–{end}
            </span>{" "}
            of {totalCount}
          </span>
          {totalPages > 1 ? (
            <Pagination className="justify-end mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                    aria-disabled={page <= 1}
                  />
                </PaginationItem>
                {firstVisiblePage > 1 ? (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(1);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {firstVisiblePage > 2 ? (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : null}
                  </>
                ) : null}
                {visiblePages.map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      isActive={pageNum === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNum);
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {lastVisiblePage < totalPages ? (
                  <>
                    {lastVisiblePage < totalPages - 1 ? (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : null}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(totalPages);
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                ) : null}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
                    aria-disabled={page >= totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
