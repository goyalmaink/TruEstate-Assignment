import { prisma } from '../lib/prisma.js';
import type { SalesQueryParams, SalesResponse, FilterOptions } from '../types/sales.type.js';
import { buildWhereClause } from '../utils/query.js';

export class SalesService {
    private prisma = prisma;

    constructor() {
        this.prisma = prisma;
    }

    public async getSales(params: SalesQueryParams): Promise<SalesResponse> {
        const { page = 1, pageSize = 10, search, filters, sort } = params;
        const skip = (page - 1) * pageSize;
        const whereClause = buildWhereClause(search, filters);
        const orderBy = this.buildOrderBy(sort);

        try {
            const [rawData, totalRecords] = await Promise.all([
                this.prisma.sales.findMany({
                    where: whereClause,
                    orderBy: orderBy,
                    skip: skip,
                    take: pageSize,
                }),
                this.prisma.sales.count({
                    where: whereClause,
                }),
            ]);

            const mappedData = rawData.map(record => ({
                'Transaction ID': record.id, 
                // Frontend: 'Date' <== Prisma: date
                'Date': record.date.toISOString().split('T')[0], 
                'Customer ID': record.customerId,
                'Customer Name': record.customerName,
                'Phone Number': record.phoneNumber,
                'Gender': record.gender,
                'Age': record.age,
                'Customer Region': record.customerRegion,
                'Customer Type': record.customerType,
                'Product ID': record.productId,
                'Product Name': record.productName,
                'Brand': record.brand,
                'Product Category': record.productCategory,
                'Tags': record.tags,
                'Quantity': record.quantity,
                'Price per Unit': record.pricePerUnit,
                'Discount Percentage': record.discountPercentage,
                'Total Amount': record.totalAmount, // Pre-discount
                'Final Amount': record.finalAmount, // Post-discount
                'Payment Method': record.paymentMethod,
                'Order Status': record.orderStatus,
                'Delivery Type': record.deliveryType,
                'Store ID': record.storeId,
                'Store Location': record.storeLocation,
                'Salesperson ID': record.salespersonId,
                'Employee Name': record.employeeName,
            }));

            const totalPages = Math.ceil(totalRecords / pageSize);

            return {
                data: mappedData as any,
                page,
                pageSize,
                totalPages,
                totalRecords,
            };
        } catch (error) {
            console.error('Error in getSales service:', error);
            throw new Error('Failed to fetch sales data');
        }
    }

   public async getFilterOptions(): Promise<FilterOptions> {
    try {
        const allFields = await this.prisma.sales.findMany({
            select: {
                customerRegion: true,
                gender: true,
                productCategory: true,
                paymentMethod: true,
                orderStatus: true,
                deliveryType: true,
                brand: true,
                tags: true,
            },
        });

        const customerRegions = Array.from(new Set(allFields.map(f => f.customerRegion).filter(Boolean))).sort();
        const genders = Array.from(new Set(allFields.map(f => f.gender).filter(Boolean))).sort();
        const productCategories = Array.from(new Set(allFields.map(f => f.productCategory).filter(Boolean))).sort();
        const paymentMethods = Array.from(new Set(allFields.map(f => f.paymentMethod).filter(Boolean))).sort();
        const orderStatuses = Array.from(new Set(allFields.map(f => f.orderStatus).filter(Boolean))).sort();
        const deliveryTypes = Array.from(new Set(allFields.map(f => f.deliveryType).filter(Boolean))).sort();
        const brands = Array.from(new Set(allFields.map(f => f.brand).filter(Boolean))).sort();
        const tags = Array.from(new Set(allFields.flatMap(f => f.tags || []).filter(Boolean))).sort();

        return {
            customerRegions,
            genders,
            productCategories,
            paymentMethods,
            orderStatuses,
            deliveryTypes,
            brands,
            tags,
        };
    } catch (error) {
        console.error('Error in getFilterOptions service:', error);
        throw new Error('Failed to fetch filter options');
    }
}

    public async getStatistics() {
        try {
            const [totalSales, totalRevenue, avgOrderValue] = await Promise.all([
                this.prisma.sales.count(),
                this.prisma.sales.aggregate({
                    _sum: { finalAmount: true },
                }),
                this.prisma.sales.aggregate({
                    _avg: { finalAmount: true },
                }),
            ]);

            return {
                totalSales,
                totalRevenue: totalRevenue._sum.finalAmount || 0,
                avgOrderValue: avgOrderValue._avg.finalAmount || 0,
            };
        } catch (error) {
            console.error('Error in getStatistics service:', error);
            throw new Error('Failed to fetch statistics');
        }
    }

    private buildOrderBy(sort?: string) {
        if (!sort) {
            return { date: 'desc' as const }; // Default: newest first
        }

        switch (sort) {
            case 'date-newest':
                return { date: 'desc' as const };
            case 'date-oldest':
                return { date: 'asc' as const };
            case 'quantity-high':
                return { quantity: 'desc' as const };
            case 'quantity-low':
                return { quantity: 'asc' as const };
            case 'name-asc':
                return { customerName: 'asc' as const };
            case 'name-desc':
                return { customerName: 'desc' as const };
            default:
                return { date: 'desc' as const };
        }
    }
    public async disconnect() {
        await this.prisma.$disconnect();
    }
}