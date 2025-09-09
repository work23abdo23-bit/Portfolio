import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '@/store';
import { register as registerUser, selectAuthLoading, selectAuthError } from '@/store/slices/authSlice';
import { selectLanguage, toggleLanguage } from '@/store/slices/uiSlice';
import { RegisterRequest, UserRole } from '@/types';
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiGlobe,
  FiArrowLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Validation schema
const registerSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(/^(\+20)?[0-9]{10,11}$/, 'Please enter a valid Egyptian phone number')
    .optional(),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type RegisterFormData = RegisterRequest & {
  confirmPassword: string;
};

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const language = useAppSelector(selectLanguage);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isArabic = language === 'ar';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      const result = await dispatch(registerUser({
        ...registerData,
        role: UserRole.CUSTOMER,
      }));
      
      if (registerUser.fulfilled.match(result)) {
        toast.success(
          isArabic ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully'
        );
        navigate('/');
      } else {
        toast.error(
          result.payload || (isArabic ? 'فشل إنشاء الحساب' : 'Registration failed')
        );
      }
    } catch (error) {
      toast.error(
        isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 py-8">
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
              {isArabic ? 'إنشاء حساب جديد' : 'Create Account'}
            </h1>
            <p className="text-neutral-600">
              {isArabic 
                ? 'أنشئ حسابك للبدء في طلب الطعام'
                : 'Create your account to start ordering food'
              }
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {isArabic ? 'الاسم الأول' : 'First Name'}
                </label>
                <div className="relative">
                  <FiUser className="absolute top-3 left-3 rtl:left-auto rtl:right-3 h-5 w-5 text-neutral-400" />
                  <input
                    {...register('firstName')}
                    type="text"
                    placeholder={isArabic ? 'الاسم الأول' : 'First name'}
                    className={`input w-full pl-10 rtl:pl-3 rtl:pr-10 ${
                      errors.firstName ? 'input-error' : ''
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {isArabic ? 'اسم العائلة' : 'Last Name'}
                </label>
                <div className="relative">
                  <FiUser className="absolute top-3 left-3 rtl:left-auto rtl:right-3 h-5 w-5 text-neutral-400" />
                  <input
                    {...register('lastName')}
                    type="text"
                    placeholder={isArabic ? 'اسم العائلة' : 'Last name'}
                    className={`input w-full pl-10 rtl:pl-3 rtl:pr-10 ${
                      errors.lastName ? 'input-error' : ''
                    }`}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

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

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {isArabic ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}
              </label>
              <div className="relative">
                <FiPhone className="absolute top-3 left-3 rtl:left-auto rtl:right-3 h-5 w-5 text-neutral-400" />
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder={isArabic ? '+20 123 456 7890' : '+20 123 456 7890'}
                  className={`input w-full pl-10 rtl:pl-3 rtl:pr-10 ${
                    errors.phone ? 'input-error' : ''
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <div className="relative">
                <FiLock className="absolute top-3 left-3 rtl:left-auto rtl:right-3 h-5 w-5 text-neutral-400" />
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={isArabic ? 'أعد إدخال كلمة المرور' : 'Confirm your password'}
                  className={`input w-full pl-10 pr-10 rtl:pl-10 rtl:pr-10 ${
                    errors.confirmPassword ? 'input-error' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-3 right-3 rtl:right-auto rtl:left-3 text-neutral-400 hover:text-neutral-600"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-neutral-600 leading-relaxed">
                {isArabic ? (
                  <>
                    أوافق على{' '}
                    <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                      الشروط والأحكام
                    </Link>
                    {' '}و{' '}
                    <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                      سياسة الخصوصية
                    </Link>
                  </>
                ) : (
                  <>
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                      Privacy Policy
                    </Link>
                  </>
                )}
              </label>
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
                  <span>{isArabic ? 'جاري إنشاء الحساب...' : 'Creating account...'}</span>
                </div>
              ) : (
                <span>{isArabic ? 'إنشاء حساب' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-neutral-600">
              {isArabic ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {isArabic ? 'تسجيل الدخول' : 'Sign in'}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;