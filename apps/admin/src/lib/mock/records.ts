import { appendAuditEntry } from "@/lib/mock/audit-log";
import { getEntityMeta } from "@/lib/mock/entities";
import {
  DEFAULT_ACTOR_ID,
  type EntityRecord,
  type ListRecordsOptions,
} from "@/lib/types/entity";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function seedRecords(): Record<string, EntityRecord[]> {
  const now = new Date();
  return {
    member: [
      { id: "mem-001", memberCode: "M-1001", name: "Ada Lovelace", createdAt: daysAgo(30), updatedAt: daysAgo(2) },
      { id: "mem-002", memberCode: "M-1002", name: "Alan Turing", createdAt: daysAgo(28), updatedAt: daysAgo(5) },
      { id: "mem-003", memberCode: "M-1003", name: "Grace Hopper", createdAt: daysAgo(25), updatedAt: daysAgo(1) },
      { id: "mem-004", memberCode: "M-1004", name: "Katherine Johnson", createdAt: daysAgo(20), updatedAt: daysAgo(10) },
      { id: "mem-005", memberCode: "M-1005", name: "Margaret Hamilton", createdAt: daysAgo(18), updatedAt: daysAgo(3) },
      { id: "mem-006", memberCode: "M-1006", name: "Linus Torvalds", createdAt: daysAgo(15), updatedAt: daysAgo(7) },
      { id: "mem-007", memberCode: "M-1007", name: "Dani Kim", createdAt: daysAgo(12), updatedAt: daysAgo(4) },
      { id: "mem-008", memberCode: "M-1008", name: "Maya Okafor", createdAt: daysAgo(8), updatedAt: daysAgo(1) },
      { id: "mem-009", memberCode: "M-1009", name: "Tomás García", createdAt: daysAgo(5), updatedAt: now },
      { id: "mem-010", memberCode: "M-1010", name: "Jules Wren", createdAt: daysAgo(3), updatedAt: daysAgo(1) },
      { id: "mem-011", memberCode: "M-1011", name: "Nikola Tesla", createdAt: daysAgo(2), updatedAt: daysAgo(1) },
      { id: "mem-012", memberCode: "M-1012", name: "Marie Curie", createdAt: daysAgo(2), updatedAt: now },
      { id: "mem-013", memberCode: "M-1013", name: "Charles Babbage", createdAt: daysAgo(1), updatedAt: daysAgo(1) },
      { id: "mem-014", memberCode: "M-1014", name: "Dorothy Vaughan", createdAt: daysAgo(1), updatedAt: now },
      { id: "mem-015", memberCode: "M-1015", name: "Tim Berners-Lee", createdAt: now, updatedAt: now },
      { id: "mem-016", memberCode: "M-1016", name: "Radia Perlman", createdAt: daysAgo(6), updatedAt: daysAgo(2) },
      { id: "mem-017", memberCode: "M-1017", name: "Edsger Dijkstra", createdAt: daysAgo(9), updatedAt: daysAgo(3) },
      { id: "mem-018", memberCode: "M-1018", name: "Barbara Liskov", createdAt: daysAgo(11), updatedAt: daysAgo(4) },
      { id: "mem-019", memberCode: "M-1019", name: "Donald Knuth", createdAt: daysAgo(13), updatedAt: daysAgo(5) },
      { id: "mem-020", memberCode: "M-1020", name: "Shafi Goldwasser", createdAt: daysAgo(16), updatedAt: daysAgo(6) },
    ],
    invoice: [
      { id: "inv-001", invoiceNumber: "INV-2024-001", customerName: "BigCorp Ltd", amount: 12500, status: "paid", createdAt: daysAgo(45), updatedAt: daysAgo(40) },
      { id: "inv-002", invoiceNumber: "INV-2024-002", customerName: "Startup Inc", amount: 3200, status: "sent", createdAt: daysAgo(20), updatedAt: daysAgo(18) },
      { id: "inv-003", invoiceNumber: "INV-2024-003", customerName: "Acme Retail", amount: 890, status: "draft", createdAt: daysAgo(14), updatedAt: daysAgo(14) },
      { id: "inv-004", invoiceNumber: "INV-2024-004", customerName: "Northwind Traders", amount: 5400, status: "paid", createdAt: daysAgo(12), updatedAt: daysAgo(10) },
      { id: "inv-005", invoiceNumber: "INV-2024-005", customerName: "Globex Corp", amount: 2100, status: "void", createdAt: daysAgo(10), updatedAt: daysAgo(8) },
      { id: "inv-006", invoiceNumber: "INV-2025-001", customerName: "Initech", amount: 7600, status: "sent", createdAt: daysAgo(7), updatedAt: daysAgo(5) },
      { id: "inv-007", invoiceNumber: "INV-2025-002", customerName: "Umbrella Co", amount: 15000, status: "draft", createdAt: daysAgo(4), updatedAt: daysAgo(4) },
      { id: "inv-008", invoiceNumber: "INV-2025-003", customerName: "Stark Industries", amount: 42000, status: "paid", createdAt: daysAgo(3), updatedAt: daysAgo(2) },
      { id: "inv-009", invoiceNumber: "INV-2025-004", customerName: "Wayne Enterprises", amount: 9800, status: "sent", createdAt: daysAgo(2), updatedAt: daysAgo(1) },
      { id: "inv-010", invoiceNumber: "INV-2025-005", customerName: "Oscorp", amount: 1100, status: "draft", createdAt: daysAgo(1), updatedAt: now },
      { id: "inv-011", invoiceNumber: "INV-2025-006", customerName: "Pied Piper", amount: 4500, status: "sent", createdAt: daysAgo(6), updatedAt: daysAgo(4) },
      { id: "inv-012", invoiceNumber: "INV-2025-007", customerName: "Hooli", amount: 28000, status: "paid", createdAt: daysAgo(8), updatedAt: daysAgo(6) },
      { id: "inv-013", invoiceNumber: "INV-2025-008", customerName: "Massive Dynamic", amount: 6700, status: "draft", createdAt: daysAgo(9), updatedAt: daysAgo(9) },
      { id: "inv-014", invoiceNumber: "INV-2025-009", customerName: "Cyberdyne Systems", amount: 19900, status: "void", createdAt: daysAgo(11), updatedAt: daysAgo(10) },
      { id: "inv-015", invoiceNumber: "INV-2025-010", customerName: "Soylent Corp", amount: 2300, status: "sent", createdAt: daysAgo(13), updatedAt: daysAgo(11) },
      { id: "inv-016", invoiceNumber: "INV-2025-011", customerName: "Tyrell Corporation", amount: 31500, status: "paid", createdAt: daysAgo(15), updatedAt: daysAgo(12) },
      { id: "inv-017", invoiceNumber: "INV-2025-012", customerName: "Wonka Industries", amount: 840, status: "draft", createdAt: daysAgo(17), updatedAt: daysAgo(16) },
      { id: "inv-018", invoiceNumber: "INV-2025-013", customerName: "Vault-Tec", amount: 11200, status: "sent", createdAt: daysAgo(19), updatedAt: daysAgo(17) },
      { id: "inv-019", invoiceNumber: "INV-2025-014", customerName: "Aperture Science", amount: 5600, status: "paid", createdAt: daysAgo(22), updatedAt: daysAgo(20) },
      { id: "inv-020", invoiceNumber: "INV-2025-015", customerName: "Black Mesa", amount: 3900, status: "draft", createdAt: daysAgo(24), updatedAt: daysAgo(23) },
    ],
    customer: [
      { id: "cus-001", customerCode: "C-5001", name: "BigCorp Ltd", email: "billing@bigcorp.com", phone: "+1 555-0101", createdAt: daysAgo(60), updatedAt: daysAgo(30) },
      { id: "cus-002", customerCode: "C-5002", name: "Startup Inc", email: "hello@startup.io", phone: "+1 555-0102", createdAt: daysAgo(50), updatedAt: daysAgo(20) },
      { id: "cus-003", customerCode: "C-5003", name: "Acme Retail", email: "orders@acme.dev", phone: "+1 555-0103", createdAt: daysAgo(40), updatedAt: daysAgo(14) },
      { id: "cus-004", customerCode: "C-5004", name: "Northwind Traders", email: "sales@northwind.com", phone: "+1 555-0104", createdAt: daysAgo(35), updatedAt: daysAgo(12) },
      { id: "cus-005", customerCode: "C-5005", name: "Globex Corp", email: "info@globex.com", phone: "", createdAt: daysAgo(30), updatedAt: daysAgo(10) },
      { id: "cus-006", customerCode: "C-5006", name: "Initech", email: "accounts@initech.com", phone: "+1 555-0106", createdAt: daysAgo(25), updatedAt: daysAgo(7) },
      { id: "cus-007", customerCode: "C-5007", name: "Umbrella Co", email: "contact@umbrella.co", phone: "+1 555-0107", createdAt: daysAgo(20), updatedAt: daysAgo(4) },
      { id: "cus-008", customerCode: "C-5008", name: "Stark Industries", email: "finance@stark.com", phone: "+1 555-0108", createdAt: daysAgo(15), updatedAt: daysAgo(3) },
      { id: "cus-009", customerCode: "C-5009", name: "Wayne Enterprises", email: "ap@wayne.com", phone: "+1 555-0109", createdAt: daysAgo(10), updatedAt: daysAgo(2) },
      { id: "cus-010", customerCode: "C-5010", name: "Oscorp", email: "billing@oscorp.com", phone: "+1 555-0110", createdAt: daysAgo(5), updatedAt: now },
      { id: "cus-011", customerCode: "C-5011", name: "Pied Piper", email: "team@piedpiper.com", phone: "", createdAt: daysAgo(3), updatedAt: daysAgo(1) },
      { id: "cus-012", customerCode: "C-5012", name: "Hooli", email: "enterprise@hooli.com", phone: "+1 555-0112", createdAt: daysAgo(1), updatedAt: now },
      { id: "cus-013", customerCode: "C-5013", name: "Massive Dynamic", email: "ops@massivedynamic.com", phone: "+1 555-0113", createdAt: daysAgo(8), updatedAt: daysAgo(5) },
      { id: "cus-014", customerCode: "C-5014", name: "Cyberdyne Systems", email: "billing@cyberdyne.ai", phone: "+1 555-0114", createdAt: daysAgo(12), updatedAt: daysAgo(9) },
      { id: "cus-015", customerCode: "C-5015", name: "Soylent Corp", email: "orders@soylent.green", phone: "", createdAt: daysAgo(14), updatedAt: daysAgo(11) },
      { id: "cus-016", customerCode: "C-5016", name: "Tyrell Corporation", email: "finance@tyrell.corp", phone: "+1 555-0116", createdAt: daysAgo(18), updatedAt: daysAgo(14) },
      { id: "cus-017", customerCode: "C-5017", name: "Wonka Industries", email: "sales@wonka.chocolate", phone: "+1 555-0117", createdAt: daysAgo(22), updatedAt: daysAgo(18) },
      { id: "cus-018", customerCode: "C-5018", name: "Vault-Tec", email: "vault@fallout.com", phone: "+1 555-0118", createdAt: daysAgo(26), updatedAt: daysAgo(20) },
      { id: "cus-019", customerCode: "C-5019", name: "Aperture Science", email: "testing@aperture.com", phone: "", createdAt: daysAgo(30), updatedAt: daysAgo(24) },
      { id: "cus-020", customerCode: "C-5020", name: "Black Mesa", email: "research@blackmesa.org", phone: "+1 555-0120", createdAt: daysAgo(34), updatedAt: daysAgo(28) },
      { id: "cus-021", customerCode: "C-5021", name: "Monsters Inc", email: "screams@monsters.inc", phone: "+1 555-0121", createdAt: daysAgo(38), updatedAt: daysAgo(32) },
      { id: "cus-022", customerCode: "C-5022", name: "Buy n Large", email: "corp@buynlarge.com", phone: "+1 555-0122", createdAt: daysAgo(42), updatedAt: daysAgo(36) },
    ],
    product: [
      { id: "prd-001", sku: "SKU-1001", name: "Wireless Keyboard", category: "electronics", price: 79.99, inStock: true, createdAt: daysAgo(45), updatedAt: daysAgo(5) },
      { id: "prd-002", sku: "SKU-1002", name: "Ergonomic Mouse", category: "electronics", price: 49.99, inStock: true, createdAt: daysAgo(40), updatedAt: daysAgo(3) },
      { id: "prd-003", sku: "SKU-1003", name: "USB-C Hub", category: "electronics", price: 34.50, inStock: false, createdAt: daysAgo(35), updatedAt: daysAgo(10) },
      { id: "prd-004", sku: "SKU-2001", name: "Classic Hoodie", category: "apparel", price: 59.00, inStock: true, createdAt: daysAgo(30), updatedAt: daysAgo(2) },
      { id: "prd-005", sku: "SKU-2002", name: "Running Shoes", category: "apparel", price: 129.00, inStock: true, createdAt: daysAgo(28), updatedAt: daysAgo(7) },
      { id: "prd-006", sku: "SKU-3001", name: "Desk Lamp", category: "home", price: 45.00, inStock: true, createdAt: daysAgo(25), updatedAt: daysAgo(4) },
      { id: "prd-007", sku: "SKU-3002", name: "Ceramic Mug Set", category: "home", price: 28.00, inStock: false, createdAt: daysAgo(22), updatedAt: daysAgo(12) },
      { id: "prd-008", sku: "SKU-4001", name: "Pro License", category: "software", price: 199.00, inStock: true, createdAt: daysAgo(20), updatedAt: daysAgo(1) },
      { id: "prd-009", sku: "SKU-4002", name: "Team Plan", category: "software", price: 499.00, inStock: true, createdAt: daysAgo(18), updatedAt: daysAgo(6) },
      { id: "prd-010", sku: "SKU-1004", name: "4K Monitor", category: "electronics", price: 349.99, inStock: true, createdAt: daysAgo(15), updatedAt: daysAgo(2) },
      { id: "prd-011", sku: "SKU-2003", name: "Canvas Tote", category: "apparel", price: 22.00, inStock: true, createdAt: daysAgo(12), updatedAt: daysAgo(1) },
      { id: "prd-012", sku: "SKU-3003", name: "Throw Blanket", category: "home", price: 38.00, inStock: true, createdAt: daysAgo(8), updatedAt: now },
    ],
    order: [
      { id: "ord-001", orderNumber: "ORD-2025-001", customerName: "BigCorp Ltd", total: 1250.00, status: "delivered", createdAt: daysAgo(30), updatedAt: daysAgo(25) },
      { id: "ord-002", orderNumber: "ORD-2025-002", customerName: "Startup Inc", total: 340.50, status: "shipped", createdAt: daysAgo(20), updatedAt: daysAgo(18) },
      { id: "ord-003", orderNumber: "ORD-2025-003", customerName: "Acme Retail", total: 89.99, status: "processing", createdAt: daysAgo(14), updatedAt: daysAgo(13) },
      { id: "ord-004", orderNumber: "ORD-2025-004", customerName: "Northwind Traders", total: 2100.00, status: "delivered", createdAt: daysAgo(12), updatedAt: daysAgo(10) },
      { id: "ord-005", orderNumber: "ORD-2025-005", customerName: "Globex Corp", total: 560.00, status: "cancelled", createdAt: daysAgo(10), updatedAt: daysAgo(9) },
      { id: "ord-006", orderNumber: "ORD-2025-006", customerName: "Initech", total: 780.00, status: "shipped", createdAt: daysAgo(7), updatedAt: daysAgo(5) },
      { id: "ord-007", orderNumber: "ORD-2025-007", customerName: "Umbrella Co", total: 4200.00, status: "pending", createdAt: daysAgo(4), updatedAt: daysAgo(4) },
      { id: "ord-008", orderNumber: "ORD-2025-008", customerName: "Stark Industries", total: 15600.00, status: "delivered", createdAt: daysAgo(3), updatedAt: daysAgo(2) },
      { id: "ord-009", orderNumber: "ORD-2025-009", customerName: "Wayne Enterprises", total: 920.00, status: "processing", createdAt: daysAgo(2), updatedAt: daysAgo(1) },
      { id: "ord-010", orderNumber: "ORD-2025-010", customerName: "Oscorp", total: 175.00, status: "pending", createdAt: daysAgo(1), updatedAt: now },
      { id: "ord-011", orderNumber: "ORD-2025-011", customerName: "Pied Piper", total: 640.00, status: "shipped", createdAt: daysAgo(6), updatedAt: daysAgo(4) },
      { id: "ord-012", orderNumber: "ORD-2025-012", customerName: "Hooli", total: 8900.00, status: "delivered", createdAt: daysAgo(8), updatedAt: daysAgo(6) },
    ],
    project: [
      { id: "prj-001", projectCode: "PRJ-101", title: "Admin Dashboard Redesign", status: "active", dueDate: daysAgo(-14), createdAt: daysAgo(60), updatedAt: daysAgo(2) },
      { id: "prj-002", projectCode: "PRJ-102", title: "API v2 Migration", status: "planning", dueDate: daysAgo(-45), createdAt: daysAgo(45), updatedAt: daysAgo(5) },
      { id: "prj-003", projectCode: "PRJ-103", title: "Mobile App Launch", status: "active", dueDate: daysAgo(-7), createdAt: daysAgo(40), updatedAt: daysAgo(1) },
      { id: "prj-004", projectCode: "PRJ-104", title: "SOC 2 Compliance", status: "on_hold", dueDate: daysAgo(-30), createdAt: daysAgo(35), updatedAt: daysAgo(10) },
      { id: "prj-005", projectCode: "PRJ-105", title: "Customer Portal", status: "completed", dueDate: daysAgo(5), createdAt: daysAgo(90), updatedAt: daysAgo(5) },
      { id: "prj-006", projectCode: "PRJ-106", title: "Search Relevance", status: "active", dueDate: daysAgo(-21), createdAt: daysAgo(30), updatedAt: daysAgo(3) },
      { id: "prj-007", projectCode: "PRJ-107", title: "Billing Integration", status: "planning", dueDate: daysAgo(-60), createdAt: daysAgo(25), updatedAt: daysAgo(7) },
      { id: "prj-008", projectCode: "PRJ-108", title: "Onboarding Flow", status: "completed", dueDate: daysAgo(12), createdAt: daysAgo(50), updatedAt: daysAgo(12) },
      { id: "prj-009", projectCode: "PRJ-109", title: "Data Warehouse ETL", status: "active", dueDate: daysAgo(-10), createdAt: daysAgo(20), updatedAt: daysAgo(1) },
      { id: "prj-010", projectCode: "PRJ-110", title: "Legacy System Sunset", status: "on_hold", dueDate: daysAgo(-90), createdAt: daysAgo(15), updatedAt: daysAgo(8) },
    ],
    ticket: [
      { id: "tkt-001", ticketNumber: "TKT-5001", subject: "Cannot reset password", priority: "high", status: "resolved", createdAt: daysAgo(10), updatedAt: daysAgo(9) },
      { id: "tkt-002", ticketNumber: "TKT-5002", subject: "Invoice PDF not generating", priority: "urgent", status: "in_progress", createdAt: daysAgo(5), updatedAt: daysAgo(1) },
      { id: "tkt-003", ticketNumber: "TKT-5003", subject: "Feature request: bulk export", priority: "low", status: "open", createdAt: daysAgo(4), updatedAt: daysAgo(4) },
      { id: "tkt-004", ticketNumber: "TKT-5004", subject: "Slow page load on dashboard", priority: "medium", status: "in_progress", createdAt: daysAgo(3), updatedAt: daysAgo(2) },
      { id: "tkt-005", ticketNumber: "TKT-5005", subject: "Webhook delivery failures", priority: "high", status: "open", createdAt: daysAgo(2), updatedAt: daysAgo(2) },
      { id: "tkt-006", ticketNumber: "TKT-5006", subject: "Typo in welcome email", priority: "low", status: "closed", createdAt: daysAgo(8), updatedAt: daysAgo(7) },
      { id: "tkt-007", ticketNumber: "TKT-5007", subject: "SSO login redirect loop", priority: "urgent", status: "resolved", createdAt: daysAgo(7), updatedAt: daysAgo(6) },
      { id: "tkt-008", ticketNumber: "TKT-5008", subject: "Missing audit log entries", priority: "high", status: "in_progress", createdAt: daysAgo(1), updatedAt: now },
      { id: "tkt-009", ticketNumber: "TKT-5009", subject: "Dark mode contrast issue", priority: "medium", status: "open", createdAt: daysAgo(1), updatedAt: daysAgo(1) },
      { id: "tkt-010", ticketNumber: "TKT-5010", subject: "API rate limit too low", priority: "medium", status: "closed", createdAt: daysAgo(12), updatedAt: daysAgo(11) },
    ],
    vendor: [
      { id: "vnd-001", vendorCode: "V-1001", name: "CloudHost Pro", email: "billing@cloudhost.pro", active: true, createdAt: daysAgo(120), updatedAt: daysAgo(10) },
      { id: "vnd-002", vendorCode: "V-1002", name: "PrintWorks Co", email: "orders@printworks.co", active: true, createdAt: daysAgo(90), updatedAt: daysAgo(5) },
      { id: "vnd-003", vendorCode: "V-1003", name: "SecureAuth Inc", email: "support@secureauth.io", active: true, createdAt: daysAgo(75), updatedAt: daysAgo(3) },
      { id: "vnd-004", vendorCode: "V-1004", name: "DataPipe Analytics", email: "hello@datapipe.com", active: false, createdAt: daysAgo(60), updatedAt: daysAgo(20) },
      { id: "vnd-005", vendorCode: "V-1005", name: "ShipFast Logistics", email: "ops@shipfast.com", active: true, createdAt: daysAgo(45), updatedAt: daysAgo(2) },
      { id: "vnd-006", vendorCode: "V-1006", name: "LegalEase Partners", email: "contact@legalease.com", active: true, createdAt: daysAgo(30), updatedAt: daysAgo(8) },
      { id: "vnd-007", vendorCode: "V-1007", name: "OfficeSupply Direct", email: "sales@officesupply.direct", active: true, createdAt: daysAgo(25), updatedAt: daysAgo(1) },
      { id: "vnd-008", vendorCode: "V-1008", name: "Legacy CRM Systems", email: "info@legacycrm.net", active: false, createdAt: daysAgo(180), updatedAt: daysAgo(45) },
      { id: "vnd-009", vendorCode: "V-1009", name: "GreenEnergy Utilities", email: "accounts@greenenergy.co", active: true, createdAt: daysAgo(15), updatedAt: daysAgo(4) },
      { id: "vnd-010", vendorCode: "V-1010", name: "DevTools Marketplace", email: "team@devtools.market", active: true, createdAt: daysAgo(7), updatedAt: now },
    ],
  };
}

const store: Record<string, EntityRecord[]> = seedRecords();

function generateId(slug: string): string {
  const prefix = slug.slice(0, 3);
  const num = String(Date.now()).slice(-6);
  return `${prefix}-${num}`;
}

function searchableFields(slug: string): string[] {
  const meta = getEntityMeta(slug);
  if (!meta) return [];
  return Object.entries(meta.fields)
    .filter(([, f]) => f.searchable)
    .map(([name]) => name);
}

export function listRecords(
  slug: string,
  options: ListRecordsOptions = {},
): EntityRecord[] {
  const records = store[slug] ?? [];
  let result = [...records];

  if (options.search?.trim()) {
    const q = options.search.trim().toLowerCase();
    const fields = searchableFields(slug);
    result = result.filter((r) =>
      fields.some((f) =>
        String(r[f] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }

  if (options.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (!value || value === "all") continue;
      if (key === "emailDomain") {
        result = result.filter((r) => {
          const email = String(r.email ?? "");
          return email.toLowerCase().endsWith(`@${value.toLowerCase()}`);
        });
      } else {
        result = result.filter((r) => String(r[key] ?? "") === value);
      }
    }
  }

  if (options.sort) {
    const { field, direction } = options.sort;
    result.sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      let cmp = 0;
      if (av instanceof Date && bv instanceof Date) {
        cmp = av.getTime() - bv.getTime();
      } else if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      }
      return direction === "asc" ? cmp : -cmp;
    });
  }

  return result;
}

export function getRecord(slug: string, id: string): EntityRecord | undefined {
  return (store[slug] ?? []).find((r) => r.id === id);
}

export function countRecords(slug: string): number {
  return (store[slug] ?? []).length;
}

export function totalRecordCount(): number {
  return Object.values(store).reduce((sum, rows) => sum + rows.length, 0);
}

export function createRecord(
  slug: string,
  data: Record<string, unknown>,
  actorId = DEFAULT_ACTOR_ID,
): EntityRecord {
  const meta = getEntityMeta(slug);
  if (!meta) throw new Error(`Unknown entity: ${slug}`);

  const now = new Date();
  const record: EntityRecord = {
    id: generateId(slug),
    createdAt: now,
    updatedAt: now,
    ...data,
  };

  if (!store[slug]) store[slug] = [];
  store[slug].push(record);

  appendAuditEntry({
    entity: slug,
    recordId: record.id,
    action: "create",
    before: null,
    after: JSON.stringify(stripTimestamps(record)),
    actorId,
  });

  return record;
}

export function updateRecord(
  slug: string,
  id: string,
  data: Record<string, unknown>,
  actorId = DEFAULT_ACTOR_ID,
): EntityRecord | undefined {
  const records = store[slug];
  if (!records) return undefined;

  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return undefined;

  const existing = records[index]!;
  const before = { ...existing };
  const updated: EntityRecord = {
    ...existing,
    ...data,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date(),
  };
  records[index] = updated;

  appendAuditEntry({
    entity: slug,
    recordId: id,
    action: "update",
    before: JSON.stringify(stripTimestamps(before)),
    after: JSON.stringify(stripTimestamps(updated)),
    actorId,
  });

  return updated;
}

export function deleteRecord(
  slug: string,
  id: string,
  actorId = DEFAULT_ACTOR_ID,
): boolean {
  const records = store[slug];
  if (!records) return false;

  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return false;

  const before = records[index]!;
  records.splice(index, 1);

  appendAuditEntry({
    entity: slug,
    recordId: id,
    action: "delete",
    before: JSON.stringify(stripTimestamps(before)),
    after: null,
    actorId,
  });

  return true;
}

function stripTimestamps(record: EntityRecord): Record<string, unknown> {
  const { id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = record;
  void _createdAt;
  void _updatedAt;
  return { id, ...rest };
}
