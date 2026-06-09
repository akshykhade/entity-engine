"use client";

import { formatDistanceToNow } from "date-fns";
import {
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import type { ComponentType } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUsers } from "@/lib/hooks/use-users";
import type { AuditAction, AuditLogEntry } from "@/lib/types/entity";

const ACTION_CONFIG: Record<
  AuditAction,
  { label: string; Icon: ComponentType<{ className?: string }>; ring: string; dot: string }
> = {
  create: {
    label: "created",
    Icon: PlusIcon,
    ring: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  update: {
    label: "updated",
    Icon: PencilIcon,
    ring: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  delete: {
    label: "deleted",
    Icon: Trash2Icon,
    ring: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};

type AuditTimelineProps = {
  entries: AuditLogEntry[];
};

function formatDiff(before: string | null, after: string | null): string | null {
  if (!before && !after) return null;
  try {
    const b = before ? JSON.stringify(JSON.parse(before), null, 2) : null;
    const a = after ? JSON.stringify(JSON.parse(after), null, 2) : null;
    if (b && a) return `Before:\n${b}\n\nAfter:\n${a}`;
    if (a) return `Created:\n${a}`;
    if (b) return `Deleted:\n${b}`;
  } catch {
    return [before, after].filter(Boolean).join(" → ");
  }
  return null;
}

export function AuditTimeline({ entries }: AuditTimelineProps) {
  const { data: usersData } = useUsers();
  const actorMap = new Map((usersData?.users ?? []).map((user) => [user.id, user]));

  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No audit history for this record yet.</p>
    );
  }

  return (
    <ol className="relative flex flex-col gap-0">
      {entries.map((entry, i) => {
        const config = ACTION_CONFIG[entry.action];
        const actor = actorMap.get(entry.actorId);
        const diff = formatDiff(entry.before, entry.after);
        const isLast = i === entries.length - 1;

        return (
          <li key={entry.id} className="relative flex gap-4 pb-8">
            {!isLast ? (
              <span
                aria-hidden
                className="absolute start-[15px] top-8 bottom-0 w-px bg-border/60"
              />
            ) : null}
            <div
              className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${config.ring}`}
            >
              <config.Icon className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px]">
                    {actor?.initials ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{actor?.name ?? "Unknown"}</span>
                <span className="text-muted-foreground text-sm">{config.label} this record</span>
                <span className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                  {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
                </span>
              </div>
              {diff ? (
                <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-border/60 bg-foreground/[0.02] p-3 font-mono text-[11px] text-muted-foreground leading-relaxed">
                  {diff}
                </pre>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
