"use client";

import { UsersIcon } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { UsersTable } from "@/components/app/users-table";
import { listAdminUsers } from "@/lib/mock/users";
import { getRoles } from "@/lib/mock/permissions";

export default function UsersPage() {
  const total = listAdminUsers().length;
  const roles = getRoles();
  const [description, setDescription] = useState(
    `Showing 1–${Math.min(10, total)} of ${total} · mock data`,
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
