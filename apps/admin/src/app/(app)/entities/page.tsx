"use client";

import { EntityCard } from "@/components/app/entity-card";
import { PageHeader } from "@/components/app/page-header";
import { getEntityCatalog } from "@/lib/mock/entities";
import { countRecords } from "@/lib/mock/records";

export default function EntitiesPage() {
  const entities = getEntityCatalog();

  return (
    <div className="px-10 py-10">
      <div className="mx-auto">
        <PageHeader
          label="Catalog"
          title="Entities"
          description={`${entities.length} entities available in the admin.`}
        />
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {entities.map((entity, index) => (
            <EntityCard
              key={entity.slug}
              entity={entity}
              recordCount={countRecords(entity.slug)}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
