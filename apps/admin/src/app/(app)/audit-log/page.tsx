"use client";

import { ShieldIcon } from "lucide-react";
import { useState } from "react";
import { AuditLogTable } from "@/components/app/audit-log-table";
import { PageHeader } from "@/components/app/page-header";
import { listAuditLog } from "@/lib/mock/audit-log";

export default function AuditLogPage() {
  const total = listAuditLog({ dateRange: "all" }).length;
  const [description, setDescription] = useState(
    `Showing 1–${Math.min(20, total)} of ${total} · mock data`,
  );

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
