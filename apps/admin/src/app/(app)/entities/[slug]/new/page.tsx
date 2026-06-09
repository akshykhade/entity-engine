"use client";

import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { EntityForm } from "@/components/app/entity-form";
import { PageHeader } from "@/components/app/page-header";
import { ApiError } from "@/lib/api/client";
import { useCreateEntityRecord, useEntityMeta } from "@/lib/hooks/use-entities";
import { toast } from "@/lib/toast";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function EntityNewPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: entity, isLoading, isError } = useEntityMeta(slug);
  const createMutation = useCreateEntityRecord(slug);

  if (!isLoading && (isError || !entity)) {
    notFound();
  }

  return (
    <div className="px-10 py-10">
      <div className="mx-auto max-w-2xl">
        <Breadcrumbs
          items={[
            { label: "Entities", href: "/entities" },
            { label: entity?.name ?? slug, href: `/entities/${slug}` },
            { label: "New" },
          ]}
        />
        <PageHeader
          title={`New ${entity?.name?.toLowerCase() ?? "record"}`}
          description={entity ? `Create a new ${entity.name.toLowerCase()} record.` : "Loading…"}
        />
        {entity ? (
          <EntityForm
            entity={entity}
            submitLabel="Create"
            onCancel={() => router.push(`/entities/${slug}`)}
            onSubmit={async (data) => {
              try {
                const record = await createMutation.mutateAsync(data);
                toast.success("Record created");
                router.push(`/entities/${slug}/${record.id}`);
              } catch (error) {
                toast.error("Create failed", {
                  description: error instanceof ApiError ? error.message : undefined,
                });
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
