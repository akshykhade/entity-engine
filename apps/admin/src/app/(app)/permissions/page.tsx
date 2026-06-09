"use client";

import { KeyRoundIcon } from "lucide-react";
import { PermissionsMatrix } from "@/components/app/permissions-matrix";
import { PageHeader } from "@/components/app/page-header";
import { usePermissionMatrix } from "@/lib/hooks/use-permissions";
import { useRoles } from "@/lib/hooks/use-roles";

export default function PermissionsPage() {
  const { data: roles = [] } = useRoles();
  const { data: matrix } = usePermissionMatrix();
  const entityCount = matrix?.entities.length ?? 0;

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
          description={`${roles.length} roles · ${entityCount} entities · select a role to view and edit grants`}
        />
        <PermissionsMatrix />
      </div>
    </div>
  );
}
