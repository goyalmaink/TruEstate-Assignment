import type { Request, Response } from 'express'
import { SalesService } from '../services/sales.service.js'
import type { SalesQueryParams } from '../types/sales.type.js'
import { validateQueryParams } from '../utils/validation.js'

export class SalesController {
    private salesService: SalesService

    constructor() {
        this.salesService = new SalesService();
    }

    public getSales = async (req: Request, res: Response): Promise<void> => {
        try {
            const queryParams: SalesQueryParams = validateQueryParams(req.query);
            const result = await this.salesService.getSales(queryParams);

            res.status(200).json({
                success: true,
                data: result.data,
                pagination: {
                    page: result.page,
                    pageSize: result.pageSize,
                    totalPages: result.totalPages,
                    totalRecords: result.totalRecords,
                },
                filters: queryParams.filters,
                sort: queryParams.sort,
                search: queryParams.search,
            });
        } catch (error: any) {
            console.error('Error in getSales controller:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch sales data',
                error: error.message,
            });
        }
    };
    public getFilterOptions = async (req: Request, res: Response): Promise<void> => {
        try {
            const options = await this.salesService.getFilterOptions();

            res.status(200).json({
                success: true,
                data: options,
            });
        } catch (error: any) {
            console.error('Error in getFilterOptions controller:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch filter options',
                error: error.message,
            });
        }
    };
    public getStatistics = async (req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.salesService.getStatistics();

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error: any) {
            console.error('Error in getStatistics controller:', error)
            res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics',
                error: error.message,
            });
        }
    };
}