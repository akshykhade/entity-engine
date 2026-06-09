"use client";

import { UsersIcon } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { UsersTable } from "@/components/app/users-table";
import { useRoles } from "@/lib/hooks/use-roles";
import { useUsers } from "@/lib/hooks/use-users";

export default function UsersPage() {
  const { data: usersData } = useUsers();
  const { data: roles = [] } = useRoles();
  const total = usersData?.total ?? 0;
  const [description, setDescription] = useState(
    `Showing 1–${Math.min(10, total)} of ${total}`,
  );

  return (
    <div className="px-6 py-10">
      <div className="mx-auto">
        <PageHeader
          label="User management"
          title={
            <span className="flex items-center gap-2">
              <UsersIcon className="size-5 text-muted-foreground" />
              Users
            </span>
          }
          description={`${total} users · ${roles.length} roles · ${description}`}
        />
        <UsersTable onSummaryChange={setDescription} />
      </div>
    </div>
  );
}
