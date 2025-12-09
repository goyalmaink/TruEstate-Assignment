# TruEstate Sales Management System

A full-stack retail sales management system with advanced search, filtering, sorting, and pagination capabilities. Built to handle large datasets efficiently with a clean, modern interface and robust backend architecture.

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

**Backend:**
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- MongoDB Atlas

**Development Tools:**
- ESLint
- Prettier (optional)
- Git

## Search Implementation Summary

The search functionality is implemented using Prisma's query capabilities with the following approach:

- **Fields Searched:** Customer Name and Phone Number
- **Method:** Case-insensitive partial matching using Prisma's `contains` operator with `mode: 'insensitive'`
- **Logic:** Uses `OR` condition to search across both fields simultaneously
- **Performance:** Optimized with MongoDB text indexing for efficient searching across 100,000+ records
- **Integration:** Search works seamlessly alongside all active filters and sorting options

The `buildWhereClause` utility function in `backend/src/utils/query.ts` constructs dynamic Prisma queries that combine search terms with filter conditions using `AND` logic, ensuring accurate results.

## Filter Implementation Summary

Multi-select and range-based filtering implemented with the following structure:

**Multi-Select Filters:**
- Customer Region, Gender, Product Category, Tags, Payment Method, Order Status, Delivery Type, Brand
- **Method:** Uses Prisma's `in` operator for array-based filtering
- **Special Case:** Tags field uses `hasSome` operator since it's stored as a String array in MongoDB

**Range Filters:**
- Age Range: Uses `gte` (greater than or equal) and `lte` (less than or equal) operators
- Date Range: Includes time normalization (sets end date to 23:59:59.999) for inclusive filtering
- Price Range: Supports min/max price filtering on final amount

**Filter Combination:**
- All filters are combined using `AND` logic through Prisma's `WhereInput`
- Filters maintain state across pagination and sorting operations
- Query parameters are validated and sanitized in `validateQueryParams` function
- Empty or invalid filter values are safely ignored

## Sorting Implementation Summary

Sorting is implemented server-side using Prisma's `orderBy` clause:

**Available Sort Options:**
- Date (Newest First / Oldest First)
- Quantity (High to Low / Low to High)
- Customer Name (A-Z / Z-A)

**Implementation Details:**
- Sort parameter is passed via query string (e.g., `sort=date-newest`)
- Backend maps sort strings to Prisma `orderBy` objects in `buildOrderBy` method
- Default sort: Date (Newest First) when no sort parameter is provided
- Sort state is preserved when applying filters or performing searches
- Efficient sorting leveraging MongoDB indexes on frequently sorted fields

## Pagination Implementation Summary

Server-side pagination implemented to handle large datasets efficiently:

**Configuration:**
- **Page Size:** Fixed at 10 items per page
- **Method:** Uses Prisma's `skip` and `take` operations for offset-based pagination
- **Calculation:** `skip = (page - 1) * pageSize`

**Features:**
- Dynamic page number generation (shows up to 6 page numbers)
- Smart page number display adapts to current page position
- Previous/Next navigation with disabled states at boundaries
- Total record count and current range display
- Page state persists across filter and search changes

**Response Structure:**
```json
{
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalPages": 100,
    "totalRecords": 1000
  }
}
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend root:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/truestate?retryWrites=true&w=majority"
```

4. Generate Prisma Client:
```bash
npx prisma generate
```

5. Push the schema to MongoDB:
```bash
npx prisma db push
```

6. Seed the database with the CSV data:
```bash
npm run seed
```

7. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Accessing the Application

Open your browser and navigate to:
```
http://localhost:5173
```

The frontend will automatically connect to the backend API at `http://localhost:8000`

### Troubleshooting

**If seed fails:**
- Ensure MongoDB Atlas connection string is correct
- Verify the CSV file exists at `backend/scripts/truestate_assignment_dataset.csv`
- Check MongoDB Atlas network access allows your IP

**If filters return 500 error:**
- Run `npx prisma generate` again
- Restart the backend server
- Verify MongoDB has proper indexes

**CORS errors:**
- Backend includes CORS middleware by default
- Verify backend is running on port 8000
