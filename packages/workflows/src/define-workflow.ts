import { workflowRegistry } from "./registry";
import type { WorkflowDefinition } from "./types";

export function defineWorkflow(
  workflow: WorkflowDefinition,
): WorkflowDefinition {
  return workflowRegistry.register(workflow);
}
