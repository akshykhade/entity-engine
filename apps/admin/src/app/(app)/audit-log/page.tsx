"use client";

import { ShieldIcon } from "lucide-react";
import { useState } from "react";
import { AuditLogTable } from "@/components/app/audit-log-table";
import { PageHeader } from "@/components/app/page-header";

export default function AuditLogPage() {
  const [description, setDescription] = useState("Loading audit log…");

  return (
    <div className="px-6 py-10">
      <div className="mx-auto">
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              <ShieldIcon className="size-5 text-muted-foreground" />
              Audit log
            </span>
          }
          description={description}
        />
        <AuditLogTable onSummaryChange={setDescription} />
      </div>
    </div>
  );
}
