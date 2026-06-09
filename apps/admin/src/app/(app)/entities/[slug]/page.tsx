"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { EntityTable } from "@/components/app/entity-table";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { useEntityMeta, useEntityRecords } from "@/lib/hooks/use-entities";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function EntityListPage({ params }: PageProps) {
  const { slug } = use(params);
  const { data: entity, isLoading, isError } = useEntityMeta(slug);
  const { data: records } = useEntityRecords(slug, { page: 1, pageSize: 1 });

  if (!isLoading && (isError || !entity)) {
    notFound();
  }

  const recordCount = records?.total ?? 0;

  return (
    <div className="px-6 py-10">
      <div className="mx-auto">
        <PageHeader
          title={entity?.name ?? "…"}
          description={
            isLoading ? "Loading…" : `${recordCount} record${recordCount === 1 ? "" : "s"}`
          }
          action={
            entity ? (
              <Button size="sm" render={<Link href={`/entities/${slug}/new`} />}>
                <PlusIcon />
                New record
              </Button>
            ) : null
          }
        />
        {entity ? <EntityTable entity={entity} /> : null}
      </div>
    </div>
  );
}
