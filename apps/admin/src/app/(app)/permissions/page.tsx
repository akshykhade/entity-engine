"use client";

import { KeyRoundIcon } from "lucide-react";
import { PermissionsMatrix } from "@/components/app/permissions-matrix";
import { PageHeader } from "@/components/app/page-header";
import { getPermissionGroups, getRoles } from "@/lib/mock/permissions";

export default function PermissionsPage() {
  const roles = getRoles();
  const groups = getPermissionGroups();
  const entityCount = groups.length;

  return (
    <div className="px-6 py-10">
      <div className="mx-auto">
        <PageHeader
          label="User management"
          title={
            <span className="flex items-center gap-2">
              <KeyRoundIcon className="size-5 text-muted-foreground" />
              Permissions
            </span>
          }
          description={`${roles.length} roles · ${entityCount} entities · select a role to view its CRUD matrix · mock data`}
        />
        <PermissionsMatrix />
      </div>
    </div>
  );
}
