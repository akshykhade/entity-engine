"use client";

import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { use } from "react";
import { toast } from "@/lib/toast";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { EntityForm } from "@/components/app/entity-form";
import { PageHeader } from "@/components/app/page-header";
import { getEntityMeta, isKnownEntitySlug } from "@/lib/mock/entities";
import { createRecord } from "@/lib/mock/records";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function EntityNewPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();

  if (!isKnownEntitySlug(slug)) {
    notFound();
  }

  const entity = getEntityMeta(slug)!;

  return (
    <div className="px-10 py-10">
      <div className="mx-auto max-w-2xl">
        <Breadcrumbs
          items={[
            { label: "Entities", href: "/entities" },
            { label: entity.name, href: `/entities/${slug}` },
            { label: "New" },
          ]}
        />
        <PageHeader
          title={`New ${entity.name}`}
          description={`Create a new ${entity.name.toLowerCase()} record.`}
        />
        <EntityForm
          entity={entity}
          submitLabel="Create"
          onCancel={() => router.push(`/entities/${slug}`)}
          onSubmit={(data) => {
            const record = createRecord(slug, data);
            toast.success(`${entity.name} created`);
            router.push(`/entities/${slug}/${record.id}`);
          }}
        />
      </div>
    </div>
  );
}
