# System Architecture Documentation

## Table of Contents
1. [Backend Architecture](#backend-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Data Flow](#data-flow)
4. [Folder Structure](#folder-structure)
5. [Module Responsibilities](#module-responsibilities)

---

## Backend Architecture

### Technology Stack
- **Runtime:** Node.js with Express.js framework
- **Language:** TypeScript for type safety
- **ORM:** Prisma for database operations
- **Database:** MongoDB Atlas (NoSQL)
- **HTTP Server:** Express with CORS, Helmet, and Morgan middleware

### Architectural Pattern
The backend follows a **layered architecture** with clear separation of concerns:

```
Request → Routes → Controllers → Services → Prisma ORM → MongoDB
```

### Layer Responsibilities

#### 1. Routes Layer (`/routes`)
- Defines API endpoints and HTTP methods
- Maps URLs to controller methods
- Minimal business logic
- Example: `GET /api/sales` → `SalesController.getSales()`

#### 2. Controllers Layer (`/controllers`)
- Handles HTTP request/response lifecycle
- Validates incoming requests using utility functions
- Calls service layer for business logic
- Formats responses with consistent structure
- Error handling and HTTP status codes

**Key Controller: `sales.controller.ts`**
- `getSales()`: Handles paginated sales data retrieval
- `getFilterOptions()`: Returns available filter values
- `getStatistics()`: Provides aggregate statistics

#### 3. Services Layer (`/services`)
- Contains core business logic
- Interacts with Prisma ORM
- Handles data transformation
- Implements complex queries and aggregations

**Key Service: `sales.service.ts`**
- `getSales()`: Constructs and executes Prisma queries with filters, search, sort, and pagination
- `getFilterOptions()`: Retrieves distinct values for all filterable fields using groupBy
- `getStatistics()`: Calculates aggregates (count, sum, average)
- `buildOrderBy()`: Maps sort parameters to Prisma orderBy clauses

#### 4. Utilities Layer (`/utils`)
- Reusable helper functions
- Query building logic
- Input validation and sanitization

**Key Utilities:**
- `query.ts`: `buildWhereClause()` - Constructs dynamic Prisma where conditions
- `validation.ts`: `validateQueryParams()` - Sanitizes and validates query parameters

#### 5. Types Layer (`/types`)
- TypeScript interfaces and types
- Defines data contracts between layers
- Ensures type safety across the application

**Key Types:**
```typescript
SalesQueryParams
SalesFilters
SalesResponse
FilterOptions
```

#### 6. Data Access Layer (Prisma)
- `prisma.config.ts`: Singleton Prisma client instance
- `schema.prisma`: Database schema definition
- Handles connection pooling and query optimization

### Key Design Decisions

**1. Query Builder Pattern**
- `buildWhereClause()` dynamically constructs Prisma queries
- Combines multiple filters using AND logic
- Handles optional parameters gracefully

**2. Validation Strategy**
- All query parameters validated before processing
- Type coercion (string to number) with fallbacks
- Array parameters parsed from comma-separated strings

**3. Error Handling**
- Try-catch blocks in all async operations
- Consistent error response format
- Detailed logging for debugging

**4. Performance Optimizations**
- MongoDB indexes on frequently queried fields
- Efficient aggregation using Prisma groupBy
- Pagination to limit data transfer
- Connection pooling via Prisma

---

## Frontend Architecture

### Technology Stack
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (CDN)
- **Icons:** Lucide React
- **State Management:** React Hooks (useState, useEffect, useMemo)

### Architectural Pattern
The frontend follows a **component-based architecture** with hooks for state management:

```
App Component → UI Components → API Service → Backend
```

### Component Structure

#### 1. Main App Component (`App.tsx`)
- Root component managing global state
- Coordinates data fetching and user interactions
- Handles pagination, search, filters, and sorting

**State Management:**
```typescript
- salesData: Array of sales records
- loading: Loading indicator state
- searchTerm: Search query string
- currentPage: Current pagination page
- totalPages: Total number of pages
- totalRecords: Total record count
- statistics: Aggregated stats (units, amount, discount)
- filterOptions: Available filter values from backend
- selectedFilters: Currently active filters
- sortBy: Current sort configuration
- showFilters: Filter panel visibility
```

#### 2. FilterDropdown Component
- Reusable multi-select dropdown
- Displays available options for each filter
- Shows active filter count badge
- Checkbox-based selection

**Props:**
```typescript
title: string
options: string[]
filterKey: string
```

#### 3. AgeFilter Component
- Specialized component for age range filtering
- Input fields for min/max age
- Clear filter functionality
- Visual feedback for active filters

### Data Fetching Strategy

**1. Filter Options Fetching**
- Executed once on component mount
- Populates dropdown options for all filters
- Cached in component state

**2. Sales Data Fetching**
- Triggered by changes in: search, filters, sort, or page
- Debounced to prevent excessive API calls
- Constructs query parameters from current state
- Updates salesData and pagination info

### State Management Patterns

**1. Derived State (useMemo)**
- `activeFilterCount`: Calculates number of active filters
- Prevents unnecessary recalculations
- Updates only when selectedFilters changes

**2. Effect Dependencies**
- Separate useEffect for initial filter options
- Separate useEffect for sales data (depends on search, filters, sort, page)
- Prevents infinite loops

**3. Controlled Components**
- All inputs are controlled (value + onChange)
- Single source of truth in component state
- Predictable state updates

### UI/UX Patterns

**1. Loading States**
- Spinner displayed during data fetching
- Prevents user interaction during load
- Smooth transition to content

**2. Empty States**
- "No results found" message when data is empty
- Helpful suggestion to adjust filters

**3. Pagination Display**
- Smart page number calculation
- Shows current range (e.g., "Showing 1 to 10 of 100")
- Previous/Next buttons with disabled states

**4. Filter Management**
- Collapsible filter panel
- Active filter count badges
- "Clear All" functionality
- Individual filter clear options

### Performance Optimizations

**1. Server-Side Operations**
- All filtering, sorting, and pagination done server-side
- Minimal data transfer (10 records per request)
- Efficient for large datasets (100,000+ records)

**2. React Optimizations**
- useMemo for expensive calculations
- Controlled re-renders
- Key props for list rendering

**3. API Efficiency**
- Single endpoint for all operations
- Query parameter-based filtering
- Reduced network requests

---

## Data Flow

### Complete Request-Response Flow

#### 1. User Interaction Flow
```
User Input (Search/Filter/Sort/Page)
    ↓
React State Update (setSearchTerm, setSelectedFilters, etc.)
    ↓
useEffect Triggered
    ↓
fetchSalesData() Called
    ↓
API Request Built with URLSearchParams
```

#### 2. Backend Processing Flow
```
Express Route Handler (/api/sales)
    ↓
SalesController.getSales()
    ↓
validateQueryParams() - Sanitize input
    ↓
SalesService.getSales()
    ↓
buildWhereClause() - Construct filters
    ↓
buildOrderBy() - Construct sorting
    ↓
Prisma Query Execution
    ↓
MongoDB Query
    ↓
Data Retrieved + Count Calculated
    ↓
Response Formatted
```

#### 3. Frontend Update Flow
```
API Response Received
    ↓
setState Calls:
  - setSalesData()
  - setTotalPages()
  - setTotalRecords()
  - setStatistics()
    ↓
React Re-render
    ↓
UI Updated with New Data
```

### API Endpoints and Data Contracts

#### GET `/api/sales`

**Request Query Parameters:**
```
?search=<string>
&customerRegion=<string,string>
&gender=<string,string>
&ageMin=<number>
&ageMax=<number>
&productCategory=<string,string>
&tags=<string,string>
&paymentMethod=<string,string>
&dateFrom=<YYYY-MM-DD>
&dateTo=<YYYY-MM-DD>
&sort=<sort-option>
&page=<number>
&limit=<number>
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "Transaction ID": "string",
      "Date": "string",
      "Customer ID": "string",
      "Customer Name": "string",
      "Phone Number": "string",
      "Gender": "string",
      "Age": number,
      "Customer Region": "string",
      "Product Category": "string",
      "Quantity": number,
      "Total Amount": number,
      "Final Amount": number,
      ...
    }
  ],
  "pagination": {
    "page": number,
    "pageSize": number,
    "totalPages": number,
    "totalRecords": number
  }
}
```

#### GET `/api/sales/filters`

**Response Format:**
```json
{
  "success": true,
  "data": {
    "customerRegions": ["North", "South", ...],
    "genders": ["Male", "Female"],
    "productCategories": ["Clothing", ...],
    "tags": ["Premium", "Sale", ...],
    "paymentMethods": ["Credit Card", ...],
    "orderStatuses": ["Delivered", ...],
    "deliveryTypes": ["Express", ...],
    "brands": ["Brand A", ...]
  }
}
```

### Search Logic Flow

```
User types in search box
    ↓
searchTerm state updated
    ↓
API call with ?search=<term>
    ↓
Backend: buildWhereClause()
    ↓
Prisma query with OR condition:
  - customerName contains term (case-insensitive)
  - phoneNumber contains term (case-insensitive)
    ↓
MongoDB executes text search
    ↓
Matching records returned
    ↓
Frontend displays results
```

### Filter Logic Flow

```
User selects filter option
    ↓
selectedFilters state updated (array for multi-select)
    ↓
API call with ?filterKey=value1,value2
    ↓
Backend: parseArrayParam() splits comma-separated values
    ↓
buildWhereClause() adds to conditions array:
  - Multi-select: { field: { in: [values] } }
  - Range: { field: { gte: min, lte: max } }
  - Tags: { tags: { hasSome: [values] } }
    ↓
All conditions combined with AND
    ↓
Prisma executes filtered query
    ↓
Frontend displays filtered results
```

---

## Folder Structure

### Backend Structure
```
backend/
├── src/
│   ├── controllers/
│   │   └── sales.controller.ts       # HTTP request handlers
│   ├── services/
│   │   └── sales.service.ts          # Business logic layer
│   ├── utils/
│   │   ├── query.ts                  # Query builder utilities
│   │   └── validation.ts             # Input validation
│   ├── routes/
│   │   └── sales.routes.ts           # API route definitions
│   ├── types/
│   │   └── sales.type.ts             # TypeScript interfaces
│   ├── lib/
│   │   └── prisma.ts                 # Prisma client singleton
│   └── index.ts                       # Application entry point
├── prisma/
│   └── schema.prisma                  # Database schema
├── scripts/
│   ├── seed.ts                        # Database seeding script
│   └── truestate_assignment_dataset.csv
├── generated/
│   └── prisma/                        # Generated Prisma client
├── .env                               # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

### Frontend Structure
```
frontend/
├── src/
│   ├── App.tsx                        # Main application component
│   ├── main.tsx                       # React entry point
│   └── vite-env.d.ts                  # Vite type definitions
├── public/                            # Static assets
├── index.html                         # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts                     # Vite configuration
└── README.md
```

### Root Structure
```
TRUESTATE/
├── backend/                           # Backend application
├── frontend/                          # Frontend application
├── docs/
│   └── architecture.md                # This document
├── .gitignore
├── package.json                       # Monorepo package (optional)
└── README.md                          # Main project README
```

---

## Module Responsibilities

### Backend Modules

#### `/controllers`
**Responsibility:** HTTP layer management
- Parse HTTP requests
- Call appropriate service methods
- Format HTTP responses
- Handle HTTP errors and status codes
- Minimal business logic

**Dependencies:** Services, Types, Utils (validation)

#### `/services`
**Responsibility:** Business logic implementation
- Execute database operations via Prisma
- Implement complex queries and aggregations
- Data transformation and calculation
- Orchestrate multiple operations

**Dependencies:** Prisma, Types, Utils (query builder)

#### `/utils`
**Responsibility:** Reusable helper functions
- Query building (`buildWhereClause`)
- Input validation (`validateQueryParams`)
- String sanitization
- Type parsing (arrays, numbers, dates)

**Dependencies:** Prisma types, Application types

#### `/routes`
**Responsibility:** API routing configuration
- Define endpoint URLs
- Map HTTP methods to controllers
- Route grouping and organization
- Middleware application (if needed)

**Dependencies:** Controllers, Express

#### `/types`
**Responsibility:** Type definitions
- Interface definitions for data structures
- Type aliases for complex types
- Shared types across modules
- API contract definitions

**Dependencies:** None (pure TypeScript)

#### `/lib`
**Responsibility:** Third-party integrations
- Prisma client initialization
- Singleton pattern for database connection
- Configuration management

**Dependencies:** Prisma Client

#### `/scripts`
**Responsibility:** Utility scripts
- Database seeding
- Data migration
- CSV parsing and import

**Dependencies:** Prisma, fs, csv-parser

### Frontend Modules

#### `App.tsx`
**Responsibility:** Main application logic
- Global state management
- API communication
- Component orchestration
- Event handling
- Business logic coordination

**Dependencies:** React, API endpoints, UI components

#### `FilterDropdown` Component
**Responsibility:** Reusable filter UI
- Multi-select functionality
- Option rendering
- Selection state management
- Visual feedback (badges, highlights)

**Dependencies:** Lucide icons, Tailwind CSS

#### `AgeFilter` Component
**Responsibility:** Range filter UI
- Numeric input handling
- Min/max validation
- Clear functionality
- Specialized filter logic

**Dependencies:** Lucide icons, Tailwind CSS

### Cross-Cutting Concerns

#### Error Handling
- **Backend:** Try-catch in all async operations, consistent error responses
- **Frontend:** Error state management, user-friendly error messages

#### Validation
- **Backend:** Query parameter validation, type coercion with defaults
- **Frontend:** Input validation, controlled components

#### Performance
- **Backend:** Database indexing, efficient queries, pagination
- **Frontend:** Memoization, minimal re-renders, server-side operations

#### Security
- **Backend:** Helmet for security headers, input sanitization, CORS configuration
- **Frontend:** No sensitive data in client, XSS prevention via React

---

## Database Schema

### Sales Model (Prisma Schema)
```prisma
model Sales {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  transactionId     String   @map("Transaction ID")
  date              DateTime @map("Date")
  customerId        String   @map("Customer ID")
  customerName      String   @map("Customer Name")
  phoneNumber       String   @map("Phone Number")
  gender            String   @map("Gender")
  age               Int      @map("Age")
  customerRegion    String   @map("Customer Region")
  customerType      String   @map("Customer Type")
  productId         String   @map("Product ID")
  productName       String   @map("Product Name")
  brand             String   @map("Brand")
  productCategory   String   @map("Product Category")
  tags              String[] @map("Tags")
  quantity          Int      @map("Quantity")
  pricePerUnit      Float    @map("Price per Unit")
  discountPercentage Float   @map("Discount Percentage")
  totalAmount       Float    @map("Total Amount")
  finalAmount       Float    @map("Final Amount")
  paymentMethod     String   @map("Payment Method")
  orderStatus       String   @map("Order Status")
  deliveryType      String   @map("Delivery Type")
  storeId           String   @map("Store ID")
  storeLocation     String   @map("Store Location")
  salespersonId     String   @map("Salesperson ID")
  employeeName      String   @map("Employee Name")

  @@map("sales")
  @@index([customerName, phoneNumber])
  @@index([date])
  @@index([customerRegion])
  @@index([productCategory])
}
```

### Key Indexes
- **Text Search:** customerName, phoneNumber (for search functionality)
- **Sorting:** date (for date-based sorting)
- **Filtering:** customerRegion, productCategory (frequently filtered fields)

---

## Deployment Considerations

### Backend Deployment
- **Environment Variables:** DATABASE_URL must be configured
- **Build Command:** `npm run build` (TypeScript compilation)
- **Start Command:** `npm start`
- **Port:** 8000 (configurable)
- **Health Check:** GET `/health` endpoint

### Frontend Deployment
- **Build Command:** `npm run build`
- **Output:** `dist/` directory
- **Environment:** Update API_BASE_URL for production
- **Serving:** Static hosting (Vercel, Netlify, etc.)

### Database
- **MongoDB Atlas:** Cloud-hosted, scalable
- **Connection String:** Secured in environment variables
- **Backup:** Regular automated backups recommended

---

## Scalability Considerations

### Current Optimizations
1. Server-side pagination (handles 100,000+ records)
2. Indexed database fields for fast queries
3. Efficient aggregation with Prisma groupBy
4. Connection pooling via Prisma

### Future Improvements
1. Redis caching for filter options
2. Database read replicas for high traffic
3. CDN for static frontend assets
4. Rate limiting on API endpoints
5. Full-text search engine (Elasticsearch) for advanced search
6. Background job processing for heavy operations