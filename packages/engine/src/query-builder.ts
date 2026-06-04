import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  like,
  lt,
  lte,
  ne,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { isSoftDeleteEnabled, type EntityDefinition } from "@crud-engine/entities";

import { getTableColumn } from "./columns";
import { badRequest } from "./errors";
import type { Filter, ListQuery, Sort } from "./types";

function buildFilterCondition(entity: EntityDefinition, filter: Filter): SQL {
  const column = getTableColumn(entity, filter.field);

  switch (filter.operator) {
    case "eq":
      return eq(column, filter.value);
    case "neq":
      return ne(column, filter.value);
    case "contains":
      return like(sql`lower(${column})`, `%${String(filter.value).toLowerCase()}%`);
    case "startsWith":
      return like(sql`lower(${column})`, `${String(filter.value).toLowerCase()}%`);
    case "gt":
      return gt(column, filter.value);
    case "gte":
      return gte(column, filter.value);
    case "lt":
      return lt(column, filter.value);
    case "lte":
      return lte(column, filter.value);
    case "in":
      if (!Array.isArray(filter.value)) {
        throw badRequest(`Operator "in" requires an array value for field "${filter.field}"`);
      }
      return inArray(column, filter.value);
    default:
      throw badRequest(`Unsupported operator "${filter.operator}"`);
  }
}

function buildSearchCondition(entity: EntityDefinition, search: string): SQL | undefined {
  const searchableFields = Object.entries(entity.fields)
    .filter(([, meta]) => meta.searchable)
    .map(([fieldName]) => fieldName);

  if (searchableFields.length === 0) {
    return undefined;
  }

  const conditions = searchableFields.map((fieldName) => {
    const column = getTableColumn(entity, fieldName);
    return like(sql`lower(${column})`, `%${search.toLowerCase()}%`);
  });

  return or(...conditions);
}

function buildSort(entity: EntityDefinition, sort: Sort | undefined) {
  if (!sort) {
    return undefined;
  }

  const column = getTableColumn(entity, sort.field);
  return sort.direction === "desc" ? desc(column) : asc(column);
}

export function buildSoftDeleteCondition(entity: EntityDefinition): SQL | undefined {
  if (!isSoftDeleteEnabled(entity) || !entity.softDeleteField) {
    return undefined;
  }

  const column = getTableColumn(entity, entity.softDeleteField);
  return isNull(column);
}

export function buildWhereClause(
  entity: EntityDefinition,
  query: Pick<ListQuery, "filters" | "search">,
): SQL | undefined {
  const conditions: SQL[] = [];

  const softDeleteCondition = buildSoftDeleteCondition(entity);
  if (softDeleteCondition) {
    conditions.push(softDeleteCondition);
  }

  for (const filter of query.filters ?? []) {
    conditions.push(buildFilterCondition(entity, filter));
  }

  const searchCondition = query.search
    ? buildSearchCondition(entity, query.search)
    : undefined;

  if (searchCondition) {
    conditions.push(searchCondition);
  }

  if (conditions.length === 0) {
    return undefined;
  }

  return and(...conditions);
}

export function buildRecordWhereClause(entity: EntityDefinition, id: string): SQL {
  const pkColumn = getTableColumn(entity, entity.primaryKey);
  const conditions: SQL[] = [eq(pkColumn, id)];

  const softDeleteCondition = buildSoftDeleteCondition(entity);
  if (softDeleteCondition) {
    conditions.push(softDeleteCondition);
  }

  return and(...conditions)!;
}

export function buildOrderBy(entity: EntityDefinition, sort: Sort | undefined) {
  const order = buildSort(entity, sort);
  return order ? [order] : undefined;
}

export function getPagination(query: ListQuery) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  return {
    page,
    pageSize,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
}

export { count };
