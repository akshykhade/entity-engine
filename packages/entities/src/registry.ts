import { toEntityMeta, type EntityDefinition, type EntityMeta } from "./define-entity";

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
