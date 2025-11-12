/**
 * Query Parser for Advanced Filtering
 * Converts URL parameters to Prisma where clauses
 */

/**
 * Build Prisma where clause from URL search params
 * Supports operators: _gt, _lt, _gte, _lte, _contains, _startsWith, _endsWith
 *
 * Example:
 * ?price_gt=100&in-stock=true&name_contains=phone
 *
 * becomes:
 * {
 *   price: { gt: 100 },
 *   "in-stock": true,
 *   name: { contains: "phone", mode: "insensitive" }
 * }
 */
export function buildPrismaWhere(
  searchParams: URLSearchParams,
  schema: Record<string, string>
): Record<string, any> {
  const where: Record<string, any> = {};

  const operators = [
    { op: '_gt', prismaOp: 'gt' },
    { op: '_lt', prismaOp: 'lt' },
    { op: '_gte', prismaOp: 'gte' },
    { op: '_lte', prismaOp: 'lte' },
    { op: '_contains', prismaOp: 'contains' },
    { op: '_startsWith', prismaOp: 'startsWith' },
    { op: '_endsWith', prismaOp: 'endsWith' },
  ];

  for (const [key, value] of searchParams.entries()) {
    // Skip pagination and ID params
    if (key === 'page' || key === 'limit' || key === 'id') {
      continue;
    }

    let field = key;
    let op = 'equals'; // Default operator
    let parsedValue: any = value;

    // Check for special operators (e.g., price_gt)
    for (const operator of operators) {
      if (key.endsWith(operator.op)) {
        field = key.slice(0, -operator.op.length);
        op = operator.prismaOp;
        break;
      }
    }

    // Ensure the field is actually in the schema
    if (!schema[field]) {
      continue;
    }

    // Parse value based on schema type
    const fieldType = schema[field];
    if (fieldType === 'number') {
      parsedValue = Number(value);
      if (isNaN(parsedValue)) continue;
    } else if (fieldType === 'boolean') {
      parsedValue = value.toLowerCase() === 'true';
    } else {
      // String
      parsedValue = value;
      // 'contains' needs 'mode' for case-insensitivity
      if (op === 'contains' || op === 'startsWith' || op === 'endsWith') {
        where[field] = { [op]: parsedValue, mode: 'insensitive' };
        continue;
      }
    }

    // Build the where clause
    if (op === 'equals') {
      where[field] = parsedValue;
    } else {
      where[field] = { [op]: parsedValue };
    }
  }

  return where;
}

/**
 * Build sort/order clause from URL params
 * Example: ?sort=price&order=desc
 */
export function buildPrismaOrderBy(
  searchParams: URLSearchParams,
  schema: Record<string, string>,
  defaultSort: string = 'createdAt'
): Record<string, 'asc' | 'desc'> {
  const sortField = searchParams.get('sort') || defaultSort;
  const sortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  // Validate field exists in schema
  if (schema[sortField]) {
    return { [sortField]: sortOrder };
  }

  return { createdAt: 'desc' }; // Default
}
