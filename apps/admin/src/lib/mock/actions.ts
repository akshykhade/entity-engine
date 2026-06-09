export type MockEntityAction = {
  name: string;
  label: string;
  hint?: string;
  successMessage: (recordId: string) => string;
};

export const MOCK_ENTITY_ACTIONS: Record<string, MockEntityAction[]> = {
  member: [
    {
      name: "ping",
      label: "Ping",
      hint: "Send a test ping to verify the member is reachable.",
      successMessage: (id) => `Ping sent to member ${id}`,
    },
  ],
  invoice: [
    {
      name: "send",
      label: "Send",
      hint: "Email the invoice to the customer.",
      successMessage: (id) => `Invoice ${id} sent to customer`,
    },
    {
      name: "mark-paid",
      label: "Mark paid",
      hint: "Record payment and close the invoice.",
      successMessage: (id) => `Invoice ${id} marked as paid`,
    },
  ],
  customer: [
    {
      name: "welcome",
      label: "Send welcome",
      hint: "Send the onboarding welcome email.",
      successMessage: (id) => `Welcome email sent to customer ${id}`,
    },
    {
      name: "export",
      label: "Export",
      hint: "Download customer record as CSV.",
      successMessage: (id) => `Customer ${id} exported`,
    },
  ],
  product: [
    {
      name: "sync-inventory",
      label: "Sync inventory",
      hint: "Pull latest stock levels from the warehouse.",
      successMessage: (id) => `Inventory synced for product ${id}`,
    },
    {
      name: "archive",
      label: "Archive",
      hint: "Hide the product from the catalog without deleting.",
      successMessage: (id) => `Product ${id} archived`,
    },
  ],
  order: [
    {
      name: "fulfill",
      label: "Fulfill",
      hint: "Mark the order as shipped and notify the customer.",
      successMessage: (id) => `Order ${id} marked as fulfilled`,
    },
    {
      name: "cancel",
      label: "Cancel",
      hint: "Cancel the order and release reserved inventory.",
      successMessage: (id) => `Order ${id} cancelled`,
    },
  ],
  project: [
    {
      name: "complete",
      label: "Complete",
      hint: "Mark the project as completed and archive milestones.",
      successMessage: (id) => `Project ${id} marked complete`,
    },
    {
      name: "archive",
      label: "Archive",
      hint: "Move the project to the archive without deleting data.",
      successMessage: (id) => `Project ${id} archived`,
    },
  ],
  ticket: [
    {
      name: "assign",
      label: "Assign",
      hint: "Assign the ticket to the next available agent.",
      successMessage: (id) => `Ticket ${id} assigned`,
    },
    {
      name: "escalate",
      label: "Escalate",
      hint: "Raise priority and notify the on-call team.",
      successMessage: (id) => `Ticket ${id} escalated`,
    },
    {
      name: "resolve",
      label: "Resolve",
      hint: "Close the ticket and send a resolution summary.",
      successMessage: (id) => `Ticket ${id} resolved`,
    },
  ],
  vendor: [
    {
      name: "deactivate",
      label: "Deactivate",
      hint: "Disable the vendor without removing historical records.",
      successMessage: (id) => `Vendor ${id} deactivated`,
    },
    {
      name: "renew",
      label: "Renew contract",
      hint: "Extend the vendor contract for another term.",
      successMessage: (id) => `Contract renewed for vendor ${id}`,
    },
  ],
};

export function getActionNamesForEntity(slug: string): string[] {
  return (MOCK_ENTITY_ACTIONS[slug] ?? []).map((action) => action.name);
}

export function getActionLabel(slug: string, action: string): string {
  const def = MOCK_ENTITY_ACTIONS[slug]?.find((item) => item.name === action);
  if (!def) {
    return action.charAt(0).toUpperCase() + action.slice(1).replace(/-/g, " ");
  }
  return def.label;
}

export function runMockEntityAction(
  slug: string,
  action: string,
  recordId: string,
): string {
  const def = MOCK_ENTITY_ACTIONS[slug]?.find((item) => item.name === action);
  if (!def) {
    return `Action "${action}" completed for ${recordId}`;
  }
  return def.successMessage(recordId);
}

export function getCustomActionsForEntity(slug: string): MockEntityAction[] {
  return MOCK_ENTITY_ACTIONS[slug] ?? [];
}
