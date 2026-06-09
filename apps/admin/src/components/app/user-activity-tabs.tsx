"use client";

import { UserAccessLogSection } from "@/components/app/user-access-log-section";
import { UserSessionLogSection } from "@/components/app/user-session-log-section";
import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ui/tabs";
import {
  listAccessLogForUser,
  listSessionsForUser,
} from "@/lib/mock/users";

type UserActivityTabsProps = {
  userId: string;
  refreshKey?: number;
};

export function UserActivityTabs({ userId, refreshKey = 0 }: UserActivityTabsProps) {
  const accessCount = listAccessLogForUser(userId).length;
  const sessionCount = listSessionsForUser(userId).length;

  return (
    <section className="mt-10 pt-8 border-border/60 border-t">
      <Tabs defaultValue="access">
        <TabsList variant="underline" >
          <TabsTab value="access">
            Access log
            {accessCount > 0 ? (
              <span className="font-mono tabular-nums text-[10px] text-muted-foreground">
                {accessCount}
              </span>
            ) : null}
          </TabsTab>
          <TabsTab value="sessions">
            Sessions
            {sessionCount > 0 ? (
              <span className="font-mono tabular-nums text-[10px] text-muted-foreground">
                {sessionCount}
              </span>
            ) : null}
          </TabsTab>
        </TabsList>

        <TabsPanel value="access" className="mt-6">
          <p className="mb-4 text-muted-foreground text-sm">
            Recent sign-in activity for this user.
          </p>
          <UserAccessLogSection
            key={`access-${refreshKey}`}
            userId={userId}
            embedded
          />
        </TabsPanel>

        <TabsPanel value="sessions" className="mt-6">
          <p className="mb-4 text-muted-foreground text-sm">
            Active and recent sign-in sessions for this user.
          </p>
          <UserSessionLogSection
            key={`sessions-${refreshKey}`}
            userId={userId}
            embedded
          />
        </TabsPanel>
      </Tabs>
    </section>
  );
}
