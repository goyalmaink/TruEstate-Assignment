// import { prisma } from '../lib/prisma.js';
import  { Prisma } from '../generated/prisma/client.js';
import type { SalesFilters } from '../types/sales.type.js'

export function buildWhereClause(
    search?: string,
    filters?: SalesFilters
): Prisma.SalesWhereInput {
    const conditions: Prisma.SalesWhereInput[] = [];

    if (search && search.trim()) {
        conditions.push({
            OR: [
                {
                    customerName: {
                        contains: search.trim(),
                        mode: 'insensitive',
                    },
                },
                {
                    phoneNumber: {
                        contains: search.trim(),
                        mode: 'insensitive',
                    },
                },
            ],
        });
    }

    if (filters) {
        if (filters.customerRegion && filters.customerRegion.length > 0) {
            conditions.push({
                customerRegion: {
                    in: filters.customerRegion,
                },
            });
        }

        if (filters.gender && filters.gender.length > 0) {
            conditions.push({
                gender: {
                    in: filters.gender,
                },
            });
        }

        if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
            const ageCondition: any = {};
            if (filters.ageMin !== undefined) {
                ageCondition.gte = filters.ageMin;
            }
            if (filters.ageMax !== undefined) {
                ageCondition.lte = filters.ageMax;
            }
            conditions.push({
                age: ageCondition,
            });
        }

        if (filters.productCategory && filters.productCategory.length > 0) {
            conditions.push({
                productCategory: {
                    in: filters.productCategory,
                },
            });
        }

        if (filters.tags && filters.tags.length > 0) {
            conditions.push({
                tags: {
                    hasSome: filters.tags,
                },
            });
        }

        if (filters.paymentMethod && filters.paymentMethod.length > 0) {
            conditions.push({
                paymentMethod: {
                    in: filters.paymentMethod,
                },
            });
        }

        if (filters.orderStatus && filters.orderStatus.length > 0) {
            conditions.push({
                orderStatus: {
                    in: filters.orderStatus,
                },
            });
        }

        if (filters.deliveryType && filters.deliveryType.length > 0) {
            conditions.push({
                deliveryType: {
                    in: filters.deliveryType,
                },
            });
        }

        if (filters.brand && filters.brand.length > 0) {
            conditions.push({
                brand: {
                    in: filters.brand,
                },
            });
        }

        if (filters.dateFrom || filters.dateTo) {
            const dateCondition: any = {};
            if (filters.dateFrom) {
                dateCondition.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                const dateTo = new Date(filters.dateTo);
                dateTo.setHours(23, 59, 59, 999);
                dateCondition.lte = dateTo;
            }
            conditions.push({
                date: dateCondition,
            });
        }

        if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
            const priceCondition: any = {};
            if (filters.priceMin !== undefined) {
                priceCondition.gte = filters.priceMin;
            }
            if (filters.priceMax !== undefined) {
                priceCondition.lte = filters.priceMax;
            }
            conditions.push({
                finalAmount: priceCondition,
            });
        }
    }

    if (conditions.length === 0) {
        return {};
    }

    // if (conditions.length === 1) {
    //     return conditions[0];
    // }

    return {
        AND: conditions,
    };
}