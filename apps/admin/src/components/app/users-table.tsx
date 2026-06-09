"use client";

import { formatDistanceToNow } from "date-fns";
import { SearchIcon, ShieldIcon, UserPlusIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChangePasswordDialog } from "@/components/app/change-password-dialog";
import { UserRowActions } from "@/components/app/user-row-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRoleLabel, getRoleTone, roleSelectItems } from "@/lib/api/roles";
import { ApiError } from "@/lib/api/client";
import { useRoles } from "@/lib/hooks/use-roles";
import { setUserPassword } from "@/lib/api/users";
import { useUsers } from "@/lib/hooks/use-users";
import { toast } from "@/lib/toast";
import type { AdminUser, UserStatus } from "@/lib/types/entity";

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<UserStatus, string> = {
  active: "border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
  invited: "border-amber-500/30 text-amber-700 dark:text-amber-400",
  suspended: "border-destructive/30 text-destructive",
};

function getVisiblePages(current: number, total: number): number[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - 2);
  const end = Math.min(total, start + 4);
  start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

type UsersTableProps = {
  onSummaryChange?: (summary: string) => void;
};

function isInteractiveClickTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      'button, a, input, select, textarea, [role="checkbox"], [data-slot="checkbox"]',
    ),
  );
}

export function UsersTable({ onSummaryChange }: UsersTableProps = {}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const { data: roles = [] } = useRoles();
  const roleItems = [{ value: "all", label: "All roles" }, ...roleSelectItems(roles)];
  const { data, isLoading, isError, refetch } = useUsers({
    search,
    roleId: roleId === "all" ? undefined : roleId,
    status,
    sort: { field: "name", direction: "asc" },
  });
  const users = data?.users ?? [];
  const totalCount = data?.total ?? users.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const start = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalCount);
  const paginatedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const visiblePages = getVisiblePages(page, totalPages);
  const firstVisiblePage = visiblePages[0] ?? 1;
  const lastVisiblePage = visiblePages[visiblePages.length - 1] ?? totalPages;

  const hasFilters = search.length > 0 || roleId !== "all" || status !== "all";

  useEffect(() => {
    setPage(1);
  }, [search, roleId, status]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    onSummaryChange?.(
      totalCount === 0
        ? "No users match filters"
        : `Showing ${start}–${end} of ${totalCount}`,
    );
  }, [end, onSummaryChange, start, totalCount]);

  function clearFilters() {
    setSearch("");
    setRoleId("all");
    setStatus("all");
  }

  async function handleChangePassword(userId: string, password: string) {
    try {
      await setUserPassword(userId, password);
      toast.success("Password updated", {
        description: "The user will be signed out of all sessions.",
      });
    } catch (error) {
      toast.error("Password update failed", {
        description: error instanceof ApiError ? error.message : undefined,
      });
    }
  }

  function handleImpersonate(user: AdminUser) {
    toast.info(`Impersonating ${user.name}`, {
      description: "You are now viewing the app as this user. Mock session only.",
      action: {
        label: "End session",
        onClick: () => toast.success("Impersonation ended"),
      },
    });
  }

  return (
    <>
      <div className="bg-card shadow-xs/5 border rounded-xl">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b">
          <InputGroup className="w-full max-w-xs">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <Select
            value={roleId}
            onValueChange={(value) => setRoleId(value ?? "all")}
            items={roleItems}
          >
            <SelectTrigger className="w-36 h-8" size="sm">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectPopup>
              <SelectItem value="all">All roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.label ?? role.name}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>

          <Select
            value={status}
            onValueChange={(value) =>
              setStatus((value as UserStatus | "all") ?? "all")
            }
          >
            <SelectTrigger className="w-32 h-8" size="sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectPopup>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectPopup>
          </Select>

          {hasFilters ? (
            <Button size="xs" variant="ghost" onClick={clearFilters}>
              <XIcon />
              Clear
            </Button>
          ) : null}

          <Button size="sm" className="ml-auto" render={<Link href="/users/new" />}>
            <UserPlusIcon />
            New user
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center px-6 py-16 text-muted-foreground text-sm">
            Loading users…
          </div>
        ) : isError ? (
          <div className="flex flex-col justify-center items-center px-6 py-16 text-center">
            <p className="font-heading text-base">Failed to load users</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col justify-center items-center px-6 py-16 text-center">
            <p className="font-heading text-base">No users found</p>
            <p className="mt-1 max-w-sm text-muted-foreground text-sm">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-4">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="pe-4 w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={(e) => {
                      if (isInteractiveClickTarget(e.target)) return;
                      router.push(`/users/${user.id}`);
                    }}
                  >
                    <TableCell className="ps-4">
                      <div className="flex items-center gap-3">
                        <Avatar className={`size-8 ${getRoleTone(user.roleId, roles)}`}>
                          <AvatarFallback className="bg-transparent font-medium text-[11px]">
                            {user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-muted-foreground text-xs">{user.email}</div>
                          {user.phone ? (
                            <div className="text-muted-foreground/70 text-xs">{user.phone}</div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {roles.find((r) => r.id === user.roleId)?.name === "admin" ? (
                        <Badge variant="outline" className="gap-1">
                          <ShieldIcon className="size-3" />
                          {getRoleLabel(user.roleId, roles)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="default">
                          {getRoleLabel(user.roleId, roles)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        size="default"
                        className={STATUS_BADGE[user.status]}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDistanceToNow(user.lastActive, { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {user.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="pe-4" onClick={(e) => e.stopPropagation()}>
                      <UserRowActions
                        user={user}
                        onChangePassword={() => setPasswordUser(user)}
                        onImpersonate={() => handleImpersonate(user)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
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
                        className={
                          page >= totalPages ? "pointer-events-none opacity-50" : undefined
                        }
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

      <ChangePasswordDialog
        user={passwordUser}
        open={passwordUser !== null}
        onOpenChange={(open) => !open && setPasswordUser(null)}
        onConfirm={(userId, password) => handleChangePassword(userId, password)}
      />

    </>
  );
}
