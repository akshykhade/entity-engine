"use client";

import { UserAccessLogSection } from "@/components/app/user-access-log-section";
import { UserSessionLogSection } from "@/components/app/user-session-log-section";
import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ui/tabs";
import { useUserSessions } from "@/lib/hooks/use-users";

type UserActivityTabsProps = {
  userId: string;
  refreshKey?: number;
};

export function UserActivityTabs({ userId }: UserActivityTabsProps) {
  const { data: sessions = [] } = useUserSessions(userId);

  return (
    <section className="mt-10 pt-8 border-border/60 border-t">
      <Tabs defaultValue="sessions">
        <TabsList variant="underline">
          <TabsTab value="access">Access log</TabsTab>
          <TabsTab value="sessions">
            Sessions
            {sessions.length > 0 ? (
              <span className="font-mono tabular-nums text-[10px] text-muted-foreground">
                {sessions.length}
              </span>
            ) : null}
          </TabsTab>
        </TabsList>

        <TabsPanel value="access" className="mt-6">
          <p className="mb-4 text-muted-foreground text-sm">
            Access log integration is planned for a later phase.
          </p>
          <UserAccessLogSection userId={userId} embedded />
        </TabsPanel>

        <TabsPanel value="sessions" className="mt-6">
          <UserSessionLogSection userId={userId} embedded />
        </TabsPanel>
      </Tabs>
    </section>
  );
}
