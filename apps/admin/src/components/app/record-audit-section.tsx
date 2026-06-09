"use client";

import { AuditTimeline } from "@/components/app/audit-timeline";
import { useRecordAuditLog } from "@/lib/hooks/use-entities";
import type { AuditLogEntry } from "@/lib/types/entity";

type RecordAuditSectionProps = {
  entity: string;
  recordId: string;
};

function mapAuditEntries(
  entries: Array<{
    id: string;
    entity: string;
    recordId: string;
    action: string;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    actorId: string;
    createdAt: string;
  }>,
): AuditLogEntry[] {
  return entries.map((entry) => ({
    id: entry.id,
    entity: entry.entity,
    recordId: entry.recordId,
    action: entry.action as AuditLogEntry["action"],
    before: entry.before ? JSON.stringify(entry.before) : null,
    after: entry.after ? JSON.stringify(entry.after) : null,
    actorId: entry.actorId,
    createdAt: new Date(entry.createdAt),
  }));
}

export function RecordAuditSection({ entity, recordId }: RecordAuditSectionProps) {
  const { data = [], isLoading } = useRecordAuditLog(entity, recordId);
  const entries = mapAuditEntries(data);

  return (
    <section className="mt-10 border-t border-border/60 pt-8">
      <h2 className="font-heading text-lg">Audit history</h2>
      <p className="mt-1 text-muted-foreground text-sm">
        Changes made to this record over time.
      </p>
      <div className="mt-6">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading audit history…</p>
        ) : (
          <AuditTimeline entries={entries} />
        )}
      </div>
    </section>
  );
}
