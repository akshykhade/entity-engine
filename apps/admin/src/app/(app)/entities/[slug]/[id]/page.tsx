"use client";

import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { EntityEditActions } from "@/components/app/entity-edit-actions";
import { EntityForm } from "@/components/app/entity-form";
import { PageHeader } from "@/components/app/page-header";
import { RecordAuditSection } from "@/components/app/record-audit-section";
import { ApiError } from "@/lib/api/client";
import {
  useEntityMeta,
  useEntityRecord,
  useUpdateEntityRecord,
} from "@/lib/hooks/use-entities";
import { toast } from "@/lib/toast";

type PageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export default function EntityEditPage({ params }: PageProps) {
  const { slug, id } = use(params);
  const router = useRouter();
  const { data: entity, isLoading: metaLoading, isError: metaError } = useEntityMeta(slug);
  const { data: record, isLoading: recordLoading, isError: recordError } = useEntityRecord(slug, id);
  const updateMutation = useUpdateEntityRecord(slug, id);

  if (!metaLoading && (metaError || !entity)) {
    notFound();
  }
  if (!recordLoading && (recordError || !record)) {
    notFound();
  }

  return (
    <div className="px-10 py-10">
      <div className="mx-auto max-w-2xl">
        <Breadcrumbs
          items={[
            { label: "Entities", href: "/entities" },
            { label: entity?.name ?? slug, href: `/entities/${slug}` },
            { label: id },
          ]}
        />
        <PageHeader
          title="Edit record"
          description={entity ? `Update ${entity.name.toLowerCase()} fields.` : "Loading…"}
          action={entity ? <EntityEditActions entity={entity} recordId={id} /> : null}
        />
        {entity && record ? (
          <>
            <EntityForm
              key={record.updatedAt.toString()}
              entity={entity}
              record={record}
              onCancel={() => router.push(`/entities/${slug}`)}
              onSubmit={async (data) => {
                try {
                  await updateMutation.mutateAsync(data);
                  toast.success("Record saved");
                } catch (error) {
                  toast.error("Save failed", {
                    description: error instanceof ApiError ? error.message : undefined,
                  });
                }
              }}
            />
            <RecordAuditSection entity={slug} recordId={id} />
          </>
        ) : null}
      </div>
    </div>
  );
}
