import type { DomainDefinition } from "../register-domain";

import { memberActions } from "./actions";
import { member } from "./model";
import { memberPermissions } from "./permissions";
import { memberReports } from "./reports";
import { memberWorkflow } from "./workflow";

export { member, members } from "./model";

export const memberDomain: DomainDefinition = {
  entity: member,
  actions: memberActions,
  permissions: memberPermissions,
  workflow: memberWorkflow,
  reports: memberReports,
};
