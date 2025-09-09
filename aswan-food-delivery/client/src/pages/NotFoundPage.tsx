import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store';
import { selectLanguage } from '@/store/slices/uiSlice';
import { FiHome, FiArrowRight } from 'react-icons/fi';

const NotFoundPage: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const isArabic = language === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Illustration */}
          <div className="mb-8">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-8xl font-bold text-primary-300 mb-4"
            >
              404
            </motion.div>
            <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft">
              <span className="text-white text-4xl font-bold">أ</span>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-4">
            {isArabic ? 'الصفحة غير موجودة' : 'Page Not Found'}
          </h1>
          
          <p className="text-neutral-600 mb-8 leading-relaxed">
            {isArabic 
              ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.'
              : 'Sorry, the page you are looking for does not exist or has been moved to another location.'
            }
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/"
              className="btn btn-primary w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <FiHome className="h-5 w-5" />
              <span>{isArabic ? 'العودة للرئيسية' : 'Back to Home'}</span>
            </Link>
            
            <Link
              to="/restaurants"
              className="btn btn-outline w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <span>{isArabic ? 'تصفح المطاعم' : 'Browse Restaurants'}</span>
              <FiArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-12 text-sm text-neutral-500">
            <p>
              {isArabic ? 'تحتاج مساعدة؟' : 'Need help?'}{' '}
              <a 
                href="mailto:support@aswanfood.com" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {isArabic ? 'تواصل معنا' : 'Contact us'}
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;