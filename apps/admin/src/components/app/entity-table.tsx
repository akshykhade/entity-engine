"use client";

import { Trash2Icon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { DeleteConfirmDialog } from "@/components/app/delete-confirm-dialog";
import { EntityRowActions } from "@/components/app/entity-row-actions";
import { FilterToolbar } from "@/components/app/filter-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { runMockEntityAction } from "@/lib/mock/actions";
import { deleteRecord, listRecords } from "@/lib/mock/records";
import type { EntityMeta } from "@/lib/types/entity";

type EntityTableProps = {
  entity: EntityMeta;
};

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  draft: "border-muted-foreground/30 text-muted-foreground",
  sent: "border-sky-500/30 text-sky-700 dark:text-sky-400",
  paid: "border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
  void: "border-destructive/30 text-destructive",
};

function formatCellValue(
  fieldName: string,
  value: unknown,
  entity: EntityMeta,
): ReactNode {
  if (value === undefined || value === null || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  const field = entity.fields[fieldName];
  if (fieldName === "status" && typeof value === "string") {
    return (
      <Badge variant="outline" size="default" className={STATUS_COLORS[value] ?? ""}>
        {value}
      </Badge>
    );
  }
  if (field?.storageType === "number" && fieldName === "amount") {
    return <span className="font-mono tabular-nums">${Number(value).toLocaleString()}</span>;
  }
  if (field?.storageType === "number") {
    return <span className="font-mono tabular-nums">{String(value)}</span>;
  }
  return String(value);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function isInteractiveClickTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      'button, a, input, select, textarea, [role="checkbox"], [data-slot="checkbox"]',
    ),
  );
}

export function EntityTable({ entity }: EntityTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [, setTableVersion] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [page, setPage] = useState(1);

  const records = listRecords(entity.slug, {
    search,
    filters,
    sort: { field: sortField, direction: sortDirection },
  });

  const totalCount = records.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const start = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalCount);
  const paginatedRecords = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const visiblePages = getVisiblePages(page, totalPages);
  const firstVisiblePage = visiblePages[0] ?? 1;
  const lastVisiblePage = visiblePages[visiblePages.length - 1] ?? totalPages;

  const fieldNames = Object.keys(entity.fields);
  const pageIds = paginatedRecords.map((record) => record.id);
  const selectedFilteredIds = records
    .filter((record) => selectedIds.has(record.id))
    .map((record) => record.id);
  const selectedCount = selectedFilteredIds.length;
  const selectedOnPageCount = pageIds.filter((id) => selectedIds.has(id)).length;
  const allPageSelected =
    pageIds.length > 0 && selectedOnPageCount === pageIds.length;
  const somePageSelected =
    selectedOnPageCount > 0 && selectedOnPageCount < pageIds.length;

  useEffect(() => {
    setPage(1);
  }, [search, filters, sortField, sortDirection]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function toggleRowSelection(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function toggleAllOnPage(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of pageIds) {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function handleDelete(id: string) {
    deleteRecord(entity.slug, id);
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success("Record deleted");
    setTableVersion((k) => k + 1);
  }

  function handleBulkDelete() {
    const count = selectedFilteredIds.length;
    for (const id of selectedFilteredIds) {
      deleteRecord(entity.slug, id);
    }
    clearSelection();
    toast.success(
      count === 1 ? "Record deleted" : `${count} records deleted`,
    );
    setTableVersion((k) => k + 1);
  }

  function handleCustomAction(action: string, recordId: string) {
    toast.info(runMockEntityAction(entity.slug, action, recordId));
  }

  return (
    <>
      <div className="bg-card shadow-xs/5 border rounded-xl">
        <FilterToolbar
          entity={entity}
          search={search}
          onSearchChange={setSearch}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={(field, direction) => {
            setSortField(field);
            setSortDirection(direction);
          }}
          filters={filters}
          onFilterChange={(key, value) =>
            setFilters((prev) => ({ ...prev, [key]: value }))
          }
          onClearFilters={() => {
            setSearch("");
            setFilters({});
          }}
        />

        {selectedCount > 0 ? (
          <div className="flex items-center gap-2 px-4 py-2 border-b">
            <span className="text-sm">
              {selectedCount} selected
            </span>
            <span className="text-muted-foreground/40">·</span>
            <Button size="xs" variant="ghost" onClick={clearSelection}>
              Clear selection
            </Button>
            <Button
              size="xs"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2Icon />
              Delete
            </Button>
          </div>
        ) : null}

        {records.length === 0 ? (
          <div className="flex flex-col justify-center items-center px-6 py-16 text-center">
            <p className="font-heading text-base">No records found</p>
            <p className="mt-1 max-w-sm text-muted-foreground text-sm">
              Try adjusting your search or filters, or create a new record.
            </p>
          </div>
        ) : (
          <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4 w-px">
                  <Checkbox
                    aria-label="Select all on page"
                    checked={allPageSelected}
                    indeterminate={somePageSelected}
                    onCheckedChange={(checked) => toggleAllOnPage(checked === true)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableHead>
                {fieldNames.map((name) => (
                  <TableHead key={name}>
                    {entity.fields[name]?.label ?? name}
                  </TableHead>
                ))}
                <TableHead>Created</TableHead>
                <TableHead className="pe-4 w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.map((record) => {
                const labelField =
                  entity.slug === "member" ? "name" : (fieldNames[0] ?? "id");
                const label = String(record[labelField] ?? record.id);
                const isSelected = selectedIds.has(record.id);
                return (
                  <TableRow
                    key={record.id}
                    className="cursor-pointer"
                    data-state={isSelected ? "selected" : undefined}
                    onClick={(e) => {
                      if (isInteractiveClickTarget(e.target)) return;
                      router.push(`/entities/${entity.slug}/${record.id}`);
                    }}
                  >
                    <TableCell
                      className="ps-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        aria-label={`Select ${label}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          toggleRowSelection(record.id, checked === true)
                        }
                      />
                    </TableCell>
                    {fieldNames.map((name) => (
                      <TableCell key={name}>
                        {formatCellValue(name, record[name], entity)}
                      </TableCell>
                    ))}
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(record.createdAt)}
                    </TableCell>
                    <TableCell
                      className="pe-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EntityRowActions
                        entity={entity}
                        recordId={record.id}
                        onDelete={() => setDeleteTarget({ id: record.id, label })}
                        onCustomAction={(action) =>
                          handleCustomAction(action, record.id)
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

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
          </>
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${entity.name.toLowerCase()}?`}
        description={`This will permanently delete "${deleteTarget?.label}". This action cannot be undone.`}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget.id);
        }}
      />

      <DeleteConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selectedCount} ${entity.name.toLowerCase()}${selectedCount === 1 ? "" : "s"}?`}
        description={`This will permanently delete ${selectedCount} selected record${selectedCount === 1 ? "" : "s"}. This action cannot be undone.`}
        onConfirm={handleBulkDelete}
      />
    </>
  );
}
