"use client";

import { EntityCard } from "@/components/app/entity-card";
import { PageHeader } from "@/components/app/page-header";
import { useEntityCatalog } from "@/lib/hooks/use-entities";

export default function EntitiesPage() {
  const { data: entities = [], isLoading } = useEntityCatalog();

  return (
    <div className="px-10 py-10">
      <div className="mx-auto">
        <PageHeader
          label="Catalog"
          title="Entities"
          description={
            isLoading
              ? "Loading entities…"
              : `${entities.length} entities registered on the server.`
          }
        />
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {entities.map((entity, index) => (
            <EntityCard key={entity.slug} entity={entity} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
