"use client";

import { AuditTimeline } from "@/components/app/audit-timeline";
import { listRecordAuditLog } from "@/lib/mock/audit-log";

type RecordAuditSectionProps = {
  entity: string;
  recordId: string;
};

export function RecordAuditSection({
  entity,
  recordId,
}: RecordAuditSectionProps) {
  const entries = listRecordAuditLog(entity, recordId);

  return (
    <section className="mt-10 border-t border-border/60 pt-8">
      <h2 className="font-heading text-lg">Audit history</h2>
      <p className="mt-1 text-muted-foreground text-sm">
        Changes made to this record over time.
      </p>
      <div className="mt-6">
        <AuditTimeline entries={entries} />
      </div>
    </section>
  );
}
