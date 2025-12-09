import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import salesRoutes from './routes/sales.routes.js';

dotenv.config();

const app: Application = express();
const PORT = 8000;

app.use(helmet()); 
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(morgan('dev')); 

app.use('/api/sales', salesRoutes);


app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'TruEstate Sales Management API',
    });
});

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

