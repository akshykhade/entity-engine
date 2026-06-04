import type { EntityDefinition } from "@crud-engine/entities";
import type { ActionDefinition, EngineRegistries } from "@crud-engine/engine";
import type { PermissionDefinition } from "@crud-engine/permissions";
import type { ReportDefinition } from "@crud-engine/reports";
import type { WorkflowDefinition } from "@crud-engine/workflows";

export type DomainDefinition = {
  entity: EntityDefinition;
  actions?: ActionDefinition[];
  permissions?: PermissionDefinition[];
  workflow?: WorkflowDefinition;
  reports?: ReportDefinition[];
};

export function registerDomain(
  domain: DomainDefinition,
  registries: EngineRegistries,
): void {
  registries.entityRegistry.register(domain.entity);

  if (domain.workflow) {
    registries.workflowRegistry.register(domain.workflow);
  }

  for (const action of domain.actions ?? []) {
    registries.actionRegistry.register(action);
  }

  for (const permission of domain.permissions ?? []) {
    registries.permissionRegistry.register(permission);
  }

  for (const report of domain.reports ?? []) {
    registries.reportRegistry.register(report);
  }
}
