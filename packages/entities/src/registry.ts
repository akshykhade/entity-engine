import { toEntityMeta, type EntityDefinition, type EntityMeta } from "./define-entity";

class EntityRegistry {
  private entities = new Map<string, EntityDefinition>();
  private bySlug = new Map<string, EntityDefinition>();

  register(entity: EntityDefinition): EntityDefinition {
    this.entities.set(entity.name, entity);
    this.bySlug.set(entity.slug, entity);
    return entity;
  }

  /** Resolve by registry name (Member) or slug (member). */
  resolve(key: string): EntityDefinition {
    const byName = this.entities.get(key);
    if (byName) {
      return byName;
    }

    const bySlug = this.bySlug.get(key);
    if (bySlug) {
      return bySlug;
    }

    throw new Error(`Entity "${key}" not found`);
  }

  get(name: string): EntityDefinition {
    return this.resolve(name);
  }

  list(): EntityDefinition[] {
    return Array.from(this.entities.values());
  }

  listMeta(): EntityMeta[] {
    return this.list().map(toEntityMeta);
  }
}

export const entityRegistry = new EntityRegistry();
