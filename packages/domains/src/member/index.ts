import { entityRegistry } from "@crud-engine/entities";
import { defineAction } from "@crud-engine/engine";
import { definePermission } from "@crud-engine/permissions";
import { defineReport } from "@crud-engine/reports";
import { defineWorkflow } from "@crud-engine/workflows";

import { memberActions } from "./actions";
import { member } from "./model";
import { memberPermissions } from "./permissions";
import { memberReports } from "./reports";
import { memberWorkflow } from "./workflow";

export { member, members } from "./model";

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
