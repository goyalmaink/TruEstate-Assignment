# TruEstate AI Coding Instructions

## Project Overview

**TruEstate** is a full-stack retail sales management system built with Node.js/Express (backend) and React 18 (frontend). It handles large datasets (100,000+ records) with advanced search, filtering, sorting, and pagination. The architecture follows a **layered design pattern** with clear separation between routes, controllers, services, and utilities.

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** MongoDB Atlas with strategic indexes
- **Key Port:** Backend runs on port 8000

---

## Architectural Patterns

### Backend Layered Architecture

The backend strictly follows a 5-layer pattern:

```
Request → Routes → Controllers → Services → Utilities/Prisma → MongoDB
```

**Routes** (`backend/routes/sales.routes.ts`): Define endpoints only, no logic.

**Controllers** (`backend/controllers/sales.controller.ts`): Validate queries, format responses, handle HTTP lifecycle. Use `validateQueryParams()` for all incoming requests.

**Services** (`backend/services/sales.service.ts`): Core business logic. Construct Prisma queries using `buildWhereClause()` and `buildOrderBy()`. Always run count queries in parallel with data queries using `Promise.all()`.

**Utilities** (`backend/utils/`):
- `query.ts`: `buildWhereClause()` combines filters using AND logic. Each filter type (array, range, text) adds separate conditions.
- `validation.ts`: `parseFilters()` parses comma-separated URL params into typed filter objects. Defaults: page=1, pageSize=10.

### Data Flow Pattern

For `/api/sales?search=john&customerRegion=NYC&page=1`:
1. Routes receive request
2. Controller calls `validateQueryParams()` to parse and type-coerce query string
3. Controller calls `SalesService.getSales()`
4. Service calls `buildWhereClause()` which combines `{search OR clause} AND {filter conditions}`
5. Prisma executes where + orderBy + skip/take
6. Service maps raw DB records to frontend field names (e.g., `totalAmount` → `'Total Amount'`)
7. Controller wraps response with pagination metadata

---

## Critical Query Building Patterns

### Search Implementation

Search is **case-insensitive partial matching** on `customerName` OR `phoneNumber`:
```typescript
// In buildWhereClause()
{
  OR: [
    { customerName: { contains: search, mode: 'insensitive' } },
    { phoneNumber: { contains: search, mode: 'insensitive' } }
  ]
}
```

### Filter Combination Logic

All filters are combined with **AND logic**. Each filter type uses different Prisma operators:
- **Array filters** (Region, Gender, Category, PaymentMethod, etc.): `{ in: [...] }`
- **Array field filters** (Tags): `{ hasSome: [...] }` (MongoDB-specific for arrays)
- **Range filters** (Age, Price, Date): `{ gte, lte }`

Example from `buildWhereClause()`:
```typescript
// Multiple conditions array - all combined with AND
conditions.push({ customerRegion: { in: filters.customerRegion } });
conditions.push({ age: { gte: filters.ageMin, lte: filters.ageMax } });
conditions.push({ tags: { hasSome: filters.tags } });

// Final where clause
return conditions.length > 0 ? { AND: conditions } : {};
```

### Sorting Implementation

Sort parameter: `sort=date-newest|date-oldest|quantity-high|quantity-low|name-az|name-za`

Service method `buildOrderBy()` maps strings to Prisma objects:
```typescript
case 'date-newest': return { date: 'desc' };
case 'quantity-high': return { quantity: 'desc' };
case 'name-az': return { customerName: 'asc' };
```

---

## Common Development Workflows

### Adding a New Filter

1. Add field to `SalesFilters` interface in `backend/types/sales.type.ts`
2. Add parsing logic in `parseFilters()` in `backend/utils/validation.ts` using `parseArrayParam()` for multi-select or direct parsing for range
3. Add filter condition to `buildWhereClause()` in `backend/utils/query.ts`
4. Update `SalesService.getFilterOptions()` to fetch distinct values for the new filter
5. Add filter dropdown in React component, fetch from `/api/sales/filters` endpoint

### Modifying Pagination Behavior

Pagination is **server-side offset-based**:
- Default: pageSize = 10 (max 100)
- Calculation: `skip = (page - 1) * pageSize`
- Always fetch totalRecords in parallel: `Promise.all([findMany(...), count(...)])`
- Total pages: `Math.ceil(totalRecords / pageSize)`

To change page size: update `validateQueryParams()` and frontend UI binding.

### Database Queries

Always use the **Prisma singleton** imported from `backend/lib/prisma.ts`:
```typescript
import { prisma } from '../lib/prisma.js';

// Good: Parallel queries for performance
const [data, count] = await Promise.all([
  prisma.sales.findMany({ where: whereClause, skip, take: 10 }),
  prisma.sales.count({ where: whereClause })
]);
```

### Running the Backend

```bash
# Development with hot reload
npm run dev

# Seed database with test data
npm run seed

# Generate Prisma client after schema changes
npx prisma generate
```

### Frontend State Management

React component uses local state (no Redux). Key patterns:
- **`useEffect` with dependencies**: Separate effects for initial filters vs. data fetching
- **`useMemo` for derived state**: `activeFilterCount` recalculates only when `selectedFilters` changes
- **Controlled components**: All inputs have value + onChange handlers
- **Query string building**: Convert `selectedFilters` object → comma-separated URL params → POST to backend

---

## Prisma Schema & Indexing

The `Sales` model includes strategic **compound indexes** for query performance:

```prisma
@@index([customerName, phoneNumber])  // Search queries
@@index([date])                        // Sorting by date
@@index([customerRegion, gender, productCategory, paymentMethod])  // Filter queries
```

When adding filters, consider adding indexes on frequently-filtered fields.

After schema changes:
```bash
npx prisma migrate dev --name <description>
npx prisma db seed  # if seed script exists
```

---

## Response Format Conventions

### Successful Response (Controllers)

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalPages": 100,
    "totalRecords": 1000
  },
  "filters": { "customerRegion": ["NYC"] },
  "sort": "date-newest",
  "search": "john"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Failed to fetch sales data",
  "error": "Detailed error message (dev only)"
}
```

---

## Field Name Mapping

Backend stores as `camelCase`, frontend displays as `Title Case`:

| Backend | Frontend |
|---------|----------|
| `customerId` | `'Customer ID'` |
| `customerName` | `'Customer Name'` |
| `productCategory` | `'Product Category'` |
| `finalAmount` | `'Final Amount'` |

See `SalesService.getSales()` for complete mapping. Keep consistent when adding fields.

---

## Key Files Reference

- **Backend entry**: `backend/index.ts` (Express setup, middleware)
- **Routes**: `backend/routes/sales.routes.ts`
- **Core logic**: `backend/services/sales.service.ts` and `backend/utils/query.ts`
- **Frontend**: `frontend/src/App.tsx` (single component, 588 lines)
- **Database schema**: `backend/prisma/schema.prisma`
- **Type contracts**: `backend/types/sales.type.ts`

---

## Performance Considerations

1. **Parallel queries**: Always use `Promise.all()` for independent count + data fetches
2. **Pagination**: Required for 100K+ datasets; don't fetch all records
3. **Indexes**: Query against indexed fields (customerName, date, region, gender, category, payment method)
4. **Search optimization**: Use Prisma's `contains` with `mode: 'insensitive'` (MongoDB text indexing)
5. **Avoid N+1**: Use Prisma's `select` to fetch only needed fields

---

## Common Pitfalls

- ❌ Forgetting to validate query params before passing to service
- ❌ Mixing AND/OR logic incorrectly in `buildWhereClause()` conditions array
- ❌ Using `take` without `skip` for pagination
- ❌ Not using `Promise.all()` for independent queries
- ❌ Field name mismatches between database and frontend response
- ❌ Forgetting `mode: 'insensitive'` on search queries for case-insensitive matching
