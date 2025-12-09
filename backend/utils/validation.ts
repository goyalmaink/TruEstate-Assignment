import type { SalesQueryParams, SalesFilters } from '../types/sales.type.js'
export function validateQueryParams(query: any): SalesQueryParams {
    const params: SalesQueryParams = {};

    if (query.page) {
        const page = parseInt(query.page, 10);
        if (!isNaN(page) && page > 0) {
            params.page = page;
        } else {
            params.page = 1;
        }
    } else {
        params.page = 1;
    }
    if (query.pageSize) {
        const pageSize = parseInt(query.pageSize, 10);
        if (!isNaN(pageSize) && pageSize > 0 && pageSize <= 100) {
            params.pageSize = pageSize;
        } else {
            params.pageSize = 10;
        }
    } else {
        params.pageSize = 10;
    }
    if (query.search && typeof query.search === 'string') {
        params.search = query.search.trim();
    }
    if (query.sort && typeof query.sort === 'string') {
        params.sort = query.sort;
    }
    params.filters = parseFilters(query);

    return params;
}

function parseFilters(query: any): SalesFilters {
    const filters: SalesFilters = {};

    if (query.customerRegion) {
        filters.customerRegion = parseArrayParam(query.customerRegion);
    }

    if (query.gender) {
        filters.gender = parseArrayParam(query.gender);
    }

    if (query.productCategory) {
        filters.productCategory = parseArrayParam(query.productCategory);
    }

    if (query.tags) {
        filters.tags = parseArrayParam(query.tags);
    }

    if (query.paymentMethod) {
        filters.paymentMethod = parseArrayParam(query.paymentMethod);
    }

    if (query.orderStatus) {
        filters.orderStatus = parseArrayParam(query.orderStatus);
    }

    if (query.deliveryType) {
        filters.deliveryType = parseArrayParam(query.deliveryType);
    }

    if (query.brand) {
        filters.brand = parseArrayParam(query.brand);
    }

    // Parse age range
    if (query.ageMin) {
        const ageMin = parseInt(query.ageMin, 10);
        if (!isNaN(ageMin) && ageMin >= 0) {
            filters.ageMin = ageMin;
        }
    }

    if (query.ageMax) {
        const ageMax = parseInt(query.ageMax, 10);
        if (!isNaN(ageMax) && ageMax >= 0) {
            filters.ageMax = ageMax;
        }
    }

    if (query.dateFrom && isValidDate(query.dateFrom)) {
        filters.dateFrom = query.dateFrom;
    }

    if (query.dateTo && isValidDate(query.dateTo)) {
        filters.dateTo = query.dateTo;
    }

    if (query.priceMin) {
        const priceMin = parseFloat(query.priceMin);
        if (!isNaN(priceMin) && priceMin >= 0) {
            filters.priceMin = priceMin;
        }
    }

    if (query.priceMax) {
        const priceMax = parseFloat(query.priceMax);
        if (!isNaN(priceMax) && priceMax >= 0) {
            filters.priceMax = priceMax;
        }
    }

    return filters;
}

function parseArrayParam(param: string | string[]): string[] {
    if (Array.isArray(param)) {
        return param.filter((item) => typeof item === 'string' && item.trim());
    }
    if (typeof param === 'string') {
        return param.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [];
}

function isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

export function sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}