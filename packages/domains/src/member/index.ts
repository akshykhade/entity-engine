import { entityRegistry } from "@crud-engine/entities";
import { defineAction } from "@crud-engine/engine";
import { definePermission } from "@crud-engine/permissions";
import { defineReport } from "@crud-engine/reports";
import { defineWorkflow } from "@crud-engine/workflows";

import { memberActions } from "./actions";
import { member } from "./entity";
import { memberPermissions } from "./permissions";
import { memberReports } from "./reports";
import { memberWorkflow } from "./workflow";

export { member } from "./entity";
export { members } from "./schema";

export function registerMember(): void {
  entityRegistry.register(member);

  if (memberWorkflow) {
    defineWorkflow(memberWorkflow);
  }

  for (const action of memberActions) {
    defineAction(action);
  }

  for (const report of memberReports) {
    defineReport(report);
  }

  for (const permission of memberPermissions) {
    definePermission(permission);
  }
}
