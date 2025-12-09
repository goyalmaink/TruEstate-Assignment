import express from 'express';
const router = express.Router();
import { SalesController } from '../controllers/sales.controller.js';

const salesController = new SalesController();

router.get('/', salesController.getSales);
router.get('/filters', salesController.getFilterOptions);
router.get('/statistics', salesController.getStatistics);

export default router;
