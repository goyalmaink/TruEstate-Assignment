// backend/src/types/sales.types.ts

import type { Sales } from '../generated/prisma/client.js';

export interface SalesQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  filters?: SalesFilters;
}

export interface SalesFilters {
  customerRegion?: string[];
  gender?: string[];
  ageMin?: number;
  ageMax?: number;
  productCategory?: string[];
  tags?: string[];
  paymentMethod?: string[];
  orderStatus?: string[];
  deliveryType?: string[];
  brand?: string[];
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface SalesResponse {
  data: Sales[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export interface FilterOptions {
  customerRegions: string[];
  genders: string[];
  productCategories: string[];
  paymentMethods: string[];
  orderStatuses: string[];
  deliveryTypes: string[];
  brands: string[];
  tags: string[];
}