"use client";

import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { toast } from "@/lib/toast";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { EntityEditActions } from "@/components/app/entity-edit-actions";
import { EntityForm } from "@/components/app/entity-form";
import { PageHeader } from "@/components/app/page-header";
import { RecordAuditSection } from "@/components/app/record-audit-section";
import { getEntityMeta, isKnownEntitySlug } from "@/lib/mock/entities";
import { getRecord, updateRecord } from "@/lib/mock/records";

type PageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export default function EntityEditPage({ params }: PageProps) {
  const { slug, id } = use(params);
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isKnownEntitySlug(slug)) {
    notFound();
  }

  const entity = getEntityMeta(slug)!;
  const record = getRecord(slug, id);

  if (!record) {
    notFound();
  }

  const displayName = String(
    record.name ??
      record.title ??
      record.subject ??
      record.memberCode ??
      record.invoiceNumber ??
      record.customerCode ??
      record.orderNumber ??
      record.ticketNumber ??
      record.projectCode ??
      record.sku ??
      record.vendorCode ??
      id,
  );

  return (
    <div className="px-10 py-10">
      <div className="mx-auto max-w-2xl">
        <Breadcrumbs
          items={[
            { label: "Entities", href: "/entities" },
            { label: entity.name, href: `/entities/${slug}` },
            { label: displayName },
          ]}
        />
        <PageHeader
          title={`Edit ${entity.name}`}
          description={displayName}
          action={<EntityEditActions entity={entity} recordId={id} />}
        />
        <EntityForm
          key={`${id}-${refreshKey}`}
          entity={entity}
          record={record}
          onCancel={() => router.push(`/entities/${slug}`)}
          onSubmit={(data) => {
            updateRecord(slug, id, data);
            toast.success(`${entity.name} saved`);
            setRefreshKey((k) => k + 1);
          }}
        />
        <RecordAuditSection key={refreshKey} entity={slug} recordId={id} />
      </div>
    </div>
  );
}
