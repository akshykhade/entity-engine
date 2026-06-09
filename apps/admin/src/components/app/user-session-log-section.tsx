"use client";

import { format, formatDistanceToNow } from "date-fns";
import { LaptopIcon, LogOutIcon, SmartphoneIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApiError } from "@/lib/api/client";
import {
  useRevokeOtherUserSessions,
  useRevokeUserSession,
  useUserSessions,
} from "@/lib/hooks/use-users";
import { toast } from "@/lib/toast";

type UserSessionLogSectionProps = {
  userId: string;
  embedded?: boolean;
};

function SessionIcon({ device }: { device: string }) {
  const isMobile = /iphone|ipad|android|mobile/i.test(device);
  const Icon = isMobile ? SmartphoneIcon : LaptopIcon;
  return <Icon className="size-4" />;
}

export function UserSessionLogSection({
  userId,
  embedded = false,
}: UserSessionLogSectionProps) {
  const { data: sessions = [], isLoading, refetch } = useUserSessions(userId);
  const revokeMutation = useRevokeUserSession(userId);
  const revokeOthersMutation = useRevokeOtherUserSessions(userId);
  const otherCount = sessions.filter((s) => !s.current).length;

  async function handleRevoke(sessionId: string) {
    try {
      await revokeMutation.mutateAsync(sessionId);
      toast.success("Session revoked");
    } catch (error) {
      toast.error("Revoke failed", {
        description: error instanceof ApiError ? error.message : undefined,
      });
      void refetch();
    }
  }

  async function handleRevokeOthers() {
    try {
      await revokeOthersMutation.mutateAsync();
      toast.success(
        otherCount === 1 ? "1 session revoked" : `${otherCount} sessions revoked`,
      );
    } catch (error) {
      toast.error("Revoke failed", {
        description: error instanceof ApiError ? error.message : undefined,
      });
      void refetch();
    }
  }

  const content =
    isLoading ? (
      <p className="text-muted-foreground text-sm">Loading sessions…</p>
    ) : sessions.length === 0 ? (
      <p className="text-muted-foreground text-sm">No active sessions.</p>
    ) : (
      <div className="overflow-hidden rounded-lg border">
        <ul>
          {sessions.map((session, index) => (
            <li key={session.id}>
              {index > 0 ? <Separator /> : null}
              <div
                className={`flex items-center gap-4 px-4 py-3 ${
                  session.current
                    ? "bg-emerald-500/[0.04]"
                    : "hover:bg-foreground/[0.02]"
                }`}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
                    session.current
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-foreground/[0.06] text-muted-foreground"
                  }`}
                >
                  <SessionIcon device={session.device} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm">{session.device}</span>
                    {session.current ? (
                      <Badge
                        variant="outline"
                        size="sm"
                        className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                      >
                        Current
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-muted-foreground text-xs">
                    {session.browser} · {session.os} · {session.location}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">
                    Started {format(new Date(session.startedAt), "MMM d, yyyy · h:mm a")}
                  </p>
                </div>

                <div className="hidden shrink-0 flex-col items-end text-right sm:flex">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {session.ip}
                  </span>
                  <span className="mt-0.5 text-muted-foreground text-xs">
                    {session.current
                      ? "Active now"
                      : formatDistanceToNow(new Date(session.lastActiveAt), {
                          addSuffix: true,
                        })}
                  </span>
                </div>

                {session.current ? (
                  <span className="w-16 text-right font-mono text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em]">
                    Active
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    className="w-16 text-destructive hover:text-destructive"
                    onClick={() => handleRevoke(session.id)}
                  >
                    <XIcon />
                    Revoke
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {otherCount > 0 ? (
          <>
            <Separator />
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <p className="text-muted-foreground text-xs">
                Revoke all sessions except the current one.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleRevokeOthers}
              >
                <LogOutIcon />
                Revoke others
              </Button>
            </div>
          </>
        ) : null}
      </div>
    );

  if (embedded) {
    return content;
  }

  return (
    <section id="user-session-log" className="mt-10 border-t border-border/60 pt-8 scroll-mt-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg">Session log</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Active and recent sign-in sessions for this user.
          </p>
        </div>
        {sessions.length > 0 ? (
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            {sessions.length} session{sessions.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
      <div className="mt-6">{content}</div>
    </section>
  );
}
