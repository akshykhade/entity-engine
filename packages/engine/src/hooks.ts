import type { EntityDefinition, EntityHookContext } from "@crud-engine/entities";

import type { EngineContext } from "./errors";

export function toHookContext(
  ctx: EngineContext,
  entity: EntityDefinition,
): EntityHookContext {
  return {
    user: ctx.user
      ? {
          id: ctx.user.id,
          name: ctx.user.name,
          email: ctx.user.email,
          roles: ctx.roles,
        }
      : undefined,
    entityName: entity.name,
    slug: entity.slug,
  };
}
