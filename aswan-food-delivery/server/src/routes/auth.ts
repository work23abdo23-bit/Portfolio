import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validation';
import { ApiResponse, AuthResponse, RegisterRequest, LoginRequest } from '../types';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const validatedData = validate(registerSchema, req.body) as RegisterRequest;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          ...(validatedData.phone ? [{ phone: validatedData.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        message: existingUser.email === validatedData.email 
          ? 'Email address is already registered' 
          : 'Phone number is already registered',
        messageAr: existingUser.email === validatedData.email
          ? 'عنوان البريد الإلكتروني مسجل مسبقاً'
          : 'رقم الهاتف مسجل مسبقاً',
      };
      return res.status(409).json(response);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const authResponse: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'User registered successfully',
      messageAr: 'تم تسجيل المستخدم بنجاح',
      data: authResponse,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const validatedData = validate(loginSchema, req.body) as LoginRequest;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        phone: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        isVerified: true,
      },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid email or password',
        messageAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      };
      return res.status(401).json(response);
    }

    if (!user.isActive) {
      const response: ApiResponse = {
        success: false,
        message: 'Account is deactivated. Please contact support.',
        messageAr: 'الحساب معطل. يرجى الاتصال بالدعم الفني.',
      };
      return res.status(401).json(response);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    
    if (!isPasswordValid) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid email or password',
        messageAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      };
      return res.status(401).json(response);
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const authResponse: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Login successful',
      messageAr: 'تم تسجيل الدخول بنجاح',
      data: authResponse,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        addresses: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            governorate: true,
            latitude: true,
            longitude: true,
            isDefault: true,
          },
        },
      },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
        messageAr: 'المستخدم غير موجود',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'User profile retrieved successfully',
      messageAr: 'تم استرداد ملف المستخدم بنجاح',
      data: user,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const response: ApiResponse = {
        success: false,
        message: 'Refresh token is required',
        messageAr: 'رمز التحديث مطلوب',
      };
      return res.status(400).json(response);
    }

    const { userId } = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid refresh token',
        messageAr: 'رمز التحديث غير صالح',
      };
      return res.status(401).json(response);
    }

    // Generate new access token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const response: ApiResponse = {
      success: true,
      message: 'Token refreshed successfully',
      messageAr: 'تم تحديث الرمز بنجاح',
      data: { token },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Forgot password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const validatedData = validate(forgotPasswordSchema, req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: { id: true, firstName: true, lastName: true },
    });

    // Always return success for security reasons
    const response: ApiResponse = {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
      messageAr: 'إذا كان هناك حساب بهذا البريد الإلكتروني، فقد تم إرسال رابط إعادة تعيين كلمة المرور.',
    };

    // TODO: Implement email sending logic here
    if (user) {
      // Generate password reset token and send email
      console.log(`Password reset requested for user: ${user.firstName} ${user.lastName}`);
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post('/reset-password', async (req, res, next) => {
  try {
    const validatedData = validate(resetPasswordSchema, req.body);

    // TODO: Verify reset token and update password
    // This is a placeholder implementation
    
    const response: ApiResponse = {
      success: true,
      message: 'Password has been reset successfully',
      messageAr: 'تم إعادة تعيين كلمة المرور بنجاح',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // You could implement token blacklisting here if needed
    
    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully',
      messageAr: 'تم تسجيل الخروج بنجاح',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Verify email (placeholder)
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Verification token is required',
        messageAr: 'رمز التحقق مطلوب',
      };
      return res.status(400).json(response);
    }

    // TODO: Implement email verification logic
    
    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully',
      messageAr: 'تم التحقق من البريد الإلكتروني بنجاح',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;