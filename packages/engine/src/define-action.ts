import type { EngineContext } from "./errors";

export type ActionDefinition<T = unknown> = {
  entity: string;
  name: string;
  handler: (ctx: EngineContext, id: string, body: unknown) => Promise<T>;
};

export class ActionRegistry {
  private actions = new Map<string, ActionDefinition>();

  private key(entity: string, name: string): string {
    return `${entity}:${name}`;
  }

  register<T>(action: ActionDefinition<T>): ActionDefinition<T> {
    this.actions.set(this.key(action.entity, action.name), action);
    return action;
  }

  get(entity: string, name: string): ActionDefinition {
    const action = this.actions.get(this.key(entity, name));
    if (!action) {
      throw new Error(`Action "${name}" not found for entity "${entity}"`);
    }
    return action;
  }

  listForEntity(entity: string): string[] {
    const names: string[] = [];

    for (const action of this.actions.values()) {
      if (action.entity === entity) {
        names.push(action.name);
      }
    }

    return names.sort();
  }

  listAll(): ActionDefinition[] {
    return Array.from(this.actions.values());
  }
}

export const actionRegistry = new ActionRegistry();
