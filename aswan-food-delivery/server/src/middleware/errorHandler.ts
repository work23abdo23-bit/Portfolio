import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ApiResponse, AppError } from '../types';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let messageAr = 'خطأ داخلي في الخادم';
  let errors: Record<string, string[]> | undefined;

  // Custom App Error
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    messageAr = error.messageAr || messageAr;
  }
  // Prisma Errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        statusCode = 409;
        const field = error.meta?.target as string[];
        if (field?.includes('email')) {
          message = 'Email address is already registered';
          messageAr = 'عنوان البريد الإلكتروني مسجل مسبقاً';
        } else if (field?.includes('phone')) {
          message = 'Phone number is already registered';
          messageAr = 'رقم الهاتف مسجل مسبقاً';
        } else {
          message = 'A record with this information already exists';
          messageAr = 'سجل بهذه المعلومات موجود بالفعل';
        }
        break;
      case 'P2025':
        // Record not found
        statusCode = 404;
        message = 'Record not found';
        messageAr = 'السجل غير موجود';
        break;
      case 'P2003':
        // Foreign key constraint violation
        statusCode = 400;
        message = 'Referenced record does not exist';
        messageAr = 'السجل المرجعي غير موجود';
        break;
      case 'P2014':
        // Required relation missing
        statusCode = 400;
        message = 'Required relation is missing';
        messageAr = 'العلاقة المطلوبة مفقودة';
        break;
      default:
        message = 'Database operation failed';
        messageAr = 'فشل في عملية قاعدة البيانات';
    }
  }
  // Prisma Validation Error
  else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
    messageAr = 'البيانات المقدمة غير صالحة';
  }
  // Joi Validation Error
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    messageAr = 'فشل في التحقق من البيانات';
    errors = error.errors;
  }
  // JWT Errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    messageAr = 'رمز غير صالح';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
    messageAr = 'انتهت صلاحية الرمز';
  }
  // Multer Errors (File Upload)
  else if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File size too large';
    messageAr = 'حجم الملف كبير جداً';
  }
  else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
    messageAr = 'حقل ملف غير متوقع';
  }
  // Syntax Errors
  else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    message = 'Invalid JSON format';
    messageAr = 'تنسيق JSON غير صالح';
  }
  // Default Error
  else if (error.message) {
    message = error.message;
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error Details:', {
      statusCode,
      message,
      messageAr,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  } else {
    // Log error in production (you might want to use a proper logging service)
    console.error('🚨 Production Error:', {
      statusCode,
      message,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  const response: ApiResponse = {
    success: false,
    message,
    messageAr,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(statusCode).json(response);
};