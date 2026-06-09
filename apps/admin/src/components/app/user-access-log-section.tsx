"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAccessLogForUser } from "@/lib/mock/users";
import type { AccessLogEvent } from "@/lib/types/entity";

const EVENT_LABELS: Record<AccessLogEvent, string> = {
  login: "Login",
  logout: "Logout",
  failed_login: "Failed login",
  password_change: "Password change",
  impersonation: "Impersonation",
};

const EVENT_BADGE: Record<AccessLogEvent, string> = {
  login: "border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
  logout: "border-muted-foreground/30 text-muted-foreground",
  failed_login: "border-destructive/30 text-destructive",
  password_change: "border-amber-500/30 text-amber-700 dark:text-amber-400",
  impersonation: "border-violet-500/30 text-violet-700 dark:text-violet-400",
};

type UserAccessLogSectionProps = {
  userId: string;
  embedded?: boolean;
};

export function UserAccessLogSection({
  userId,
  embedded = false,
}: UserAccessLogSectionProps) {
  const entries = listAccessLogForUser(userId);

  const content =
    entries.length === 0 ? (
      <p className="text-muted-foreground text-sm">No access events recorded.</p>
    ) : (
      <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4">Event</TableHead>
                <TableHead>When</TableHead>
                <TableHead>IP</TableHead>
                <TableHead className="pe-4">Client</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.slice(0, 5).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="ps-4">
                    <Badge
                      variant="outline"
                      size="sm"
                      className={EVENT_BADGE[entry.event]}
                    >
                      {EVENT_LABELS[entry.event]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {format(entry.createdAt, "MMM d, yyyy · h:mm a")}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{entry.ip}</TableCell>
                  <TableCell className="pe-4 text-muted-foreground text-xs">
                    {entry.userAgent}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>
    );

  if (embedded) {
    return content;
  }

  return (
    <section id="user-access-log" className="mt-10 border-t border-border/60 pt-8 scroll-mt-6">
      <h2 className="font-heading text-lg">Access log</h2>
      <p className="mt-1 text-muted-foreground text-sm">
        Recent sign-in activity for this user.
      </p>
      <div className="mt-6">{content}</div>
    </section>
  );
}
