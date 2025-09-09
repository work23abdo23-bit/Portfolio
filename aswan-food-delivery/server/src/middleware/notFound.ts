import { Request, Response } from 'express';
import { ApiResponse } from '../types';

export const notFound = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    messageAr: `المسار ${req.originalUrl} غير موجود`,
  };
  
  res.status(404).json(response);
};