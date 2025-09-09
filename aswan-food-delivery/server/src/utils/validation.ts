import Joi from 'joi';
import { UserRole } from '@prisma/client';

// Common validation schemas
export const emailSchema = Joi.string()
  .email()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  });

export const passwordSchema = Joi.string()
  .min(6)
  .max(128)
  .required()
  .messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  });

export const phoneSchema = Joi.string()
  .pattern(/^\+?[1-9]\d{1,14}$/)
  .optional()
  .messages({
    'string.pattern.base': 'Please provide a valid phone number',
  });

export const nameSchema = Joi.string()
  .min(2)
  .max(50)
  .required()
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  });

// Auth validation schemas
export const registerSchema = Joi.object({
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .default(UserRole.CUSTOMER),
});

export const loginSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = Joi.object({
  email: emailSchema,
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Reset token is required',
    'any.required': 'Reset token is required',
  }),
  password: passwordSchema,
});

// User validation schemas
export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: phoneSchema,
  avatar: Joi.string().uri().optional(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

// Address validation schemas
export const addressSchema = Joi.object({
  title: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Address title must be at least 2 characters long',
    'string.max': 'Address title cannot exceed 50 characters',
    'string.empty': 'Address title is required',
    'any.required': 'Address title is required',
  }),
  address: Joi.string().min(10).max(200).required().messages({
    'string.min': 'Address must be at least 10 characters long',
    'string.max': 'Address cannot exceed 200 characters',
    'string.empty': 'Address is required',
    'any.required': 'Address is required',
  }),
  city: Joi.string().default('أسوان'),
  governorate: Joi.string().default('أسوان'),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  isDefault: Joi.boolean().default(false),
});

// Restaurant validation schemas
export const restaurantSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  nameAr: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  descriptionAr: Joi.string().max(500).optional(),
  address: Joi.string().min(10).max(200).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  phone: phoneSchema.required(),
  email: Joi.string().email().optional(),
  deliveryTime: Joi.number().min(5).max(120).default(30),
  deliveryFee: Joi.number().min(0).default(0),
  minimumOrder: Joi.number().min(0).default(0),
  openingTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('09:00'),
  closingTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('23:00'),
});

// Menu validation schemas
export const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  nameAr: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).optional(),
  sortOrder: Joi.number().min(0).default(0),
});

export const menuItemSchema = Joi.object({
  categoryId: Joi.string().required(),
  name: Joi.string().min(2).max(100).required(),
  nameAr: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  descriptionAr: Joi.string().max(500).optional(),
  price: Joi.number().min(0.01).required(),
  discountPrice: Joi.number().min(0).optional(),
  ingredients: Joi.string().optional(),
  allergens: Joi.string().optional(),
  calories: Joi.number().min(0).optional(),
  preparationTime: Joi.number().min(1).max(120).default(15),
  sortOrder: Joi.number().min(0).default(0),
});

// Order validation schemas
export const orderItemSchema = Joi.object({
  menuItemId: Joi.string().required(),
  quantity: Joi.number().min(1).max(50).required(),
  notes: Joi.string().max(200).optional(),
});

export const createOrderSchema = Joi.object({
  restaurantId: Joi.string().required(),
  addressId: Joi.string().required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  paymentMethod: Joi.string().valid('CASH', 'CARD', 'WALLET').required(),
  notes: Joi.string().max(500).optional(),
  couponCode: Joi.string().max(20).optional(),
});

// Review validation schemas
export const reviewSchema = Joi.object({
  restaurantId: Joi.string().optional(),
  menuItemId: Joi.string().optional(),
  orderId: Joi.string().optional(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(1000).optional(),
  images: Joi.array().items(Joi.string().uri()).max(5).optional(),
  isAnonymous: Joi.boolean().default(false),
}).xor('restaurantId', 'menuItemId'); // Either restaurantId or menuItemId is required

// Query validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
});

export const restaurantFilterSchema = Joi.object({
  search: Joi.string().max(100).optional(),
  category: Joi.string().optional(),
  minRating: Joi.number().min(0).max(5).optional(),
  maxDeliveryTime: Joi.number().min(5).max(120).optional(),
  sortBy: Joi.string().valid('rating', 'deliveryTime', 'deliveryFee', 'name').default('rating'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
}).concat(paginationSchema);

// Validation helper function
export const validate = <T>(schema: Joi.ObjectSchema<T>, data: any): T => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const validationErrors: Record<string, string[]> = {};
    
    error.details.forEach((detail) => {
      const field = detail.path.join('.');
      if (!validationErrors[field]) {
        validationErrors[field] = [];
      }
      validationErrors[field].push(detail.message);
    });

    throw {
      name: 'ValidationError',
      errors: validationErrors,
    };
  }

  return value;
};