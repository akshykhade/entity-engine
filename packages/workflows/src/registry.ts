import type {
  WorkflowDefinition,
  WorkflowValidationResult,
} from "./types";

class WorkflowRegistry {
  private workflows = new Map<string, WorkflowDefinition>();

  register(workflow: WorkflowDefinition): WorkflowDefinition {
    this.workflows.set(workflow.entity, workflow);
    return workflow;
  }

  get(entity: string): WorkflowDefinition | undefined {
    return this.workflows.get(entity);
  }

  validateTransition(
    entity: string,
    currentState: string | undefined,
    nextState: string | undefined,
  ): WorkflowValidationResult {
    const workflow = this.workflows.get(entity);
    if (!workflow || nextState === undefined) {
      return { ok: true };
    }

    if (!workflow.states.includes(nextState)) {
      return {
        ok: false,
        message: `Invalid state "${nextState}" for entity "${entity}"`,
      };
    }

    if (currentState === undefined || currentState === nextState) {
      return { ok: true };
    }

    const allowed = workflow.transitions.some(
      (transition) =>
        transition.from === currentState && transition.to === nextState,
    );

    if (!allowed) {
      return {
        ok: false,
        message: `Transition from "${currentState}" to "${nextState}" is not allowed`,
      };
    }

    return { ok: true };
  }
}

export const workflowRegistry = new WorkflowRegistry();
