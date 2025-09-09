import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { selectLanguage } from '@/store/slices/uiSlice';
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiFacebook,
  FiInstagram,
  FiTwitter,
} from 'react-icons/fi';

const Footer: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const isArabic = language === 'ar';

  return (
    <footer className="bg-neutral-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">أ</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {isArabic ? 'أسوان فود' : 'Aswan Food'}
                </h3>
                <p className="text-sm text-neutral-400">
                  {isArabic ? 'توصيل الطعام' : 'Food Delivery'}
                </p>
              </div>
            </div>
            <p className="text-neutral-400 text-sm">
              {isArabic 
                ? 'منصة توصيل الطعام الأولى في محافظة أسوان. نربط بين العملاء والمطاعم المحلية لتقديم أفضل تجربة طعام.'
                : 'The first food delivery platform in Aswan Governorate. We connect customers with local restaurants for the best food experience.'
              }
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              {isArabic ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-neutral-400 hover:text-white transition-colors text-sm">
                  {isArabic ? 'الرئيسية' : 'Home'}
                </Link>
              </li>
              <li>
                <Link to="/restaurants" className="text-neutral-400 hover:text-white transition-colors text-sm">
                  {isArabic ? 'المطاعم' : 'Restaurants'}
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-neutral-400 hover:text-white transition-colors text-sm">
                  {isArabic ? 'طلباتي' : 'My Orders'}
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-neutral-400 hover:text-white transition-colors text-sm">
                  {isArabic ? 'الملف الشخصي' : 'Profile'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              {isArabic ? 'الدعم' : 'Support'}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">
                  {isArabic ? 'مركز المساعدة' : 'Help Center'}
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">
                  {isArabic ? 'الأسئلة الشائعة' : 'FAQ'}
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">
                  {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">
                  {isArabic ? 'الشروط والأحكام' : 'Terms of Service'}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              {isArabic ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <FiPhone className="h-4 w-4 text-primary-400" />
                <span className="text-neutral-400 text-sm">+20 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <FiMail className="h-4 w-4 text-primary-400" />
                <span className="text-neutral-400 text-sm">info@aswanfood.com</span>
              </div>
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <FiMapPin className="h-4 w-4 text-primary-400 mt-0.5" />
                <span className="text-neutral-400 text-sm">
                  {isArabic ? 'أسوان، مصر' : 'Aswan, Egypt'}
                </span>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-4">
              <h5 className="text-sm font-semibold mb-3">
                {isArabic ? 'تابعنا' : 'Follow Us'}
              </h5>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <a
                  href="#"
                  className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"
                >
                  <FiFacebook className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"
                >
                  <FiInstagram className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"
                >
                  <FiTwitter className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-neutral-400 text-sm">
              {isArabic 
                ? '© 2024 أسوان فود. جميع الحقوق محفوظة.'
                : '© 2024 Aswan Food. All rights reserved.'
              }
            </p>
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <span className="text-neutral-400 text-xs">
                {isArabic ? 'صُنع بـ ❤️ لأهل أسوان' : 'Made with ❤️ for Aswan'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;