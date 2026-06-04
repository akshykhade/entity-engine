import { reportRegistry } from "@crud-engine/reports";
import type { EngineRegistries } from "@crud-engine/engine";

import { memberActions } from "./actions";
import { member } from "./model";
import { memberPermissions } from "./permissions";
import { memberReports } from "./reports";
import { memberWorkflow } from "./workflow";

export { member, members } from "./model";

export function registerMember(registries: EngineRegistries): void {
  registries.entityRegistry.register(member);

  if (memberWorkflow) {
    registries.workflowRegistry.register(memberWorkflow);
  }

  for (const action of memberActions) {
    registries.actionRegistry.register(action);
  }

  for (const report of memberReports) {
    reportRegistry.register(report);
  }

  for (const permission of memberPermissions) {
    registries.permissionRegistry.register(permission);
  }
}
