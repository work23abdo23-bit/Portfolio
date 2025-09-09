import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, selectAuthLoading, selectAuthError } from '@/store/slices/authSlice';
import { selectLanguage, toggleLanguage } from '@/store/slices/uiSlice';
import { LoginRequest } from '@/types';
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiGlobe,
  FiArrowLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const language = useAppSelector(selectLanguage);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  
  const [showPassword, setShowPassword] = useState(false);
  const isArabic = language === 'ar';

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      const result = await dispatch(login(data));
      if (login.fulfilled.match(result)) {
        toast.success(
          isArabic ? 'تم تسجيل الدخول بنجاح' : 'Login successful'
        );
        navigate(from, { replace: true });
      } else {
        toast.error(
          result.payload || (isArabic ? 'فشل تسجيل الدخول' : 'Login failed')
        );
      }
    } catch (error) {
      toast.error(
        isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-strong p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/"
                className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <FiArrowLeft className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
              </Link>
              
              <button
                onClick={() => dispatch(toggleLanguage())}
                className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
                title={isArabic ? 'English' : 'العربية'}
              >
                <FiGlobe className="h-5 w-5" />
              </button>
            </div>

            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">أ</span>
            </div>
            
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">
              {isArabic ? 'تسجيل الدخول' : 'Welcome Back'}
            </h1>
            <p className="text-neutral-600">
              {isArabic 
                ? 'سجل دخولك للوصول إلى حسابك'
                : 'Sign in to access your account'
              }
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <FiMail className="absolute top-3 left-3 rtl:left-auto rtl:right-3 h-5 w-5 text-neutral-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  className={`input w-full pl-10 rtl:pl-3 rtl:pr-10 ${
                    errors.email ? 'input-error' : ''
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {isArabic ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <FiLock className="absolute top-3 left-3 rtl:left-auto rtl:right-3 h-5 w-5 text-neutral-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isArabic ? 'أدخل كلمة المرور' : 'Enter your password'}
                  className={`input w-full pl-10 pr-10 rtl:pl-10 rtl:pr-10 ${
                    errors.password ? 'input-error' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 rtl:right-auto rtl:left-3 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right rtl:text-left">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isArabic ? 'جاري تسجيل الدخول...' : 'Signing in...'}</span>
                </div>
              ) : (
                <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-neutral-600">
              {isArabic ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {isArabic ? 'إنشاء حساب جديد' : 'Sign up'}
              </Link>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500 mb-2 text-center">
              {isArabic ? 'حسابات تجريبية:' : 'Demo Accounts:'}
            </p>
            <div className="space-y-1 text-xs text-neutral-600">
              <p><strong>{isArabic ? 'عميل:' : 'Customer:'}</strong> customer1@example.com / user123</p>
              <p><strong>{isArabic ? 'مطعم:' : 'Restaurant:'}</strong> owner1@aswanfood.com / user123</p>
              <p><strong>{isArabic ? 'مدير:' : 'Admin:'}</strong> admin@aswanfood.com / admin123</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;