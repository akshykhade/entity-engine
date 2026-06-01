export type WorkflowTransition = {
  from: string;
  to: string;
  action: string;
};

export type WorkflowDefinition = {
  entity: string;
  field: string;
  states: string[];
  transitions: WorkflowTransition[];
};

export type WorkflowValidationResult =
  | { ok: true }
  | { ok: false; message: string };
