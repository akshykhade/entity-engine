import type { EntityMeta } from "@/lib/types/entity";
import { getActionNamesForEntity } from "@/lib/mock/actions";

const INVOICE_STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Void", value: "void" },
];

const PRODUCT_CATEGORY_OPTIONS = [
  { label: "Electronics", value: "electronics" },
  { label: "Apparel", value: "apparel" },
  { label: "Home", value: "home" },
  { label: "Software", value: "software" },
];

const ORDER_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const PROJECT_STATUS_OPTIONS = [
  { label: "Planning", value: "planning" },
  { label: "Active", value: "active" },
  { label: "On Hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
];

const TICKET_PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const TICKET_STATUS_OPTIONS = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

export const ENTITY_CATALOG: EntityMeta[] = [
  {
    name: "Member",
    slug: "member",
    primaryKey: "id",
    audit: true,
    softDelete: false,
    relations: {},
    actions: getActionNamesForEntity("member"),
    fields: {
      memberCode: {
        label: "Member Code",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      name: {
        label: "Name",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
    },
  },
  {
    name: "Invoice",
    slug: "invoice",
    primaryKey: "id",
    audit: true,
    softDelete: false,
    relations: {},
    actions: getActionNamesForEntity("invoice"),
    fields: {
      invoiceNumber: {
        label: "Invoice Number",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      customerName: {
        label: "Customer Name",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      amount: {
        label: "Amount",
        searchable: false,
        sortable: true,
        required: true,
        storageType: "number",
        uiType: "number",
      },
      status: {
        label: "Status",
        searchable: false,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "select",
        options: INVOICE_STATUS_OPTIONS,
      },
    },
  },
  {
    name: "Customer",
    slug: "customer",
    primaryKey: "id",
    audit: true,
    softDelete: false,
    relations: {},
    actions: getActionNamesForEntity("customer"),
    fields: {
      customerCode: {
        label: "Customer Code",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      name: {
        label: "Name",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      email: {
        label: "Email",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "email",
      },
      phone: {
        label: "Phone",
        searchable: true,
        sortable: false,
        required: false,
        storageType: "text",
        uiType: "phone",
      },
    },
  },
  {
    name: "Product",
    slug: "product",
    primaryKey: "id",
    audit: true,
    softDelete: false,
    relations: {},
    actions: getActionNamesForEntity("product"),
    fields: {
      sku: {
        label: "SKU",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      name: {
        label: "Name",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      category: {
        label: "Category",
        searchable: false,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "select",
        options: PRODUCT_CATEGORY_OPTIONS,
      },
      price: {
        label: "Price",
        searchable: false,
        sortable: true,
        required: true,
        storageType: "number",
        uiType: "number",
      },
      inStock: {
        label: "In Stock",
        searchable: false,
        sortable: true,
        required: true,
        storageType: "boolean",
        uiType: "boolean",
      },
    },
  },
  {
    name: "Order",
    slug: "order",
    primaryKey: "id",
    audit: true,
    softDelete: false,
    relations: {},
    actions: getActionNamesForEntity("order"),
    fields: {
      orderNumber: {
        label: "Order Number",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      customerName: {
        label: "Customer Name",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      total: {
        label: "Total",
        searchable: false,
        sortable: true,
        required: true,
        storageType: "number",
        uiType: "number",
      },
      status: {
        label: "Status",
        searchable: false,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "select",
        options: ORDER_STATUS_OPTIONS,
      },
    },
  },
  {
    name: "Project",
    slug: "project",
    primaryKey: "id",
    audit: true,
    softDelete: false,
    relations: {},
    actions: getActionNamesForEntity("project"),
    fields: {
      projectCode: {
        label: "Project Code",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      title: {
        label: "Title",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      status: {
        label: "Status",
        searchable: false,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "select",
        options: PROJECT_STATUS_OPTIONS,
      },
      dueDate: {
        label: "Due Date",
        searchable: false,
        sortable: true,
        required: false,
        storageType: "datetime",
        uiType: "datetime",
      },
    },
  },
  {
    name: "Support Ticket",
    slug: "ticket",
    primaryKey: "id",
    audit: true,
    softDelete: false,
    relations: {},
    actions: getActionNamesForEntity("ticket"),
    fields: {
      ticketNumber: {
        label: "Ticket Number",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      subject: {
        label: "Subject",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      priority: {
        label: "Priority",
        searchable: false,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "select",
        options: TICKET_PRIORITY_OPTIONS,
      },
      status: {
        label: "Status",
        searchable: false,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "select",
        options: TICKET_STATUS_OPTIONS,
      },
    },
  },
  {
    name: "Vendor",
    slug: "vendor",
    primaryKey: "id",
    audit: true,
    softDelete: false,
    relations: {},
    actions: getActionNamesForEntity("vendor"),
    fields: {
      vendorCode: {
        label: "Vendor Code",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      name: {
        label: "Name",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "text",
      },
      email: {
        label: "Email",
        searchable: true,
        sortable: true,
        required: true,
        storageType: "text",
        uiType: "email",
      },
      active: {
        label: "Active",
        searchable: false,
        sortable: true,
        required: true,
        storageType: "boolean",
        uiType: "boolean",
      },
    },
  },
];

export function getEntityCatalog(): EntityMeta[] {
  return ENTITY_CATALOG;
}

export function getEntityMeta(slug: string): EntityMeta | undefined {
  return ENTITY_CATALOG.find((e) => e.slug === slug);
}

export function isKnownEntitySlug(slug: string): boolean {
  return ENTITY_CATALOG.some((e) => e.slug === slug);
}
