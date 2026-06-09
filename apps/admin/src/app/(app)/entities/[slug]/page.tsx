"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { EntityTable } from "@/components/app/entity-table";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { getEntityMeta, isKnownEntitySlug } from "@/lib/mock/entities";
import { countRecords } from "@/lib/mock/records";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function EntityListPage({ params }: PageProps) {
  const { slug } = use(params);

  if (!isKnownEntitySlug(slug)) {
    notFound();
  }

  const entity = getEntityMeta(slug)!;
  const recordCount = countRecords(slug);

  return (
    <div className="px-6 py-10">
      <div className="mx-auto">
        <PageHeader
          title={entity.name}
          description={`${recordCount} record${recordCount === 1 ? "" : "s"}`}
          action={
            <Button size="sm" render={<Link href={`/entities/${slug}/new`} />}>
              <PlusIcon />
              New record
            </Button>
          }
        />
        <EntityTable entity={entity} />
      </div>
    </div>
  );
}
