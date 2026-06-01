import { defineEntity, toEntityMeta, type EntityDefinition, type EntityMeta } from "./define-entity";
import { field } from "./field";
import { members } from "@crud-engine/db/schema/member";

export const Member = defineEntity({
  name: "Member",
  table: members,
  primaryKey: "id",
  fields: {
    memberCode: field({
      label: "Member Code",
      searchable: true,
      sortable: true,
      required: true,
    }),
    name: field({
      label: "Name",
      searchable: true,
      sortable: true,
      required: true,
    }),
  },
});

class EntityRegistry {
  private entities = new Map<string, EntityDefinition>();

  register(entity: EntityDefinition): EntityDefinition {
    this.entities.set(entity.name, entity);
    return entity;
  }

  get(name: string): EntityDefinition {
    const entity = this.entities.get(name);
    if (!entity) {
      throw new Error(`Entity "${name}" not found`);
    }
    return entity;
  }

  list(): EntityDefinition[] {
    return Array.from(this.entities.values());
  }

  listMeta(): EntityMeta[] {
    return this.list().map(toEntityMeta);
  }
}

export const entityRegistry = new EntityRegistry();

export function bootstrapEntities(): void {
  entityRegistry.register(Member);
}

bootstrapEntities();
