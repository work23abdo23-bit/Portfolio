import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchRestaurants, selectRestaurants, selectRestaurantLoading } from '@/store/slices/restaurantSlice';
import { fetchPopularItems, selectPopularItems } from '@/store/slices/restaurantSlice';
import { selectLanguage } from '@/store/slices/uiSlice';
import RestaurantCard from '@/components/ui/RestaurantCard';
import MenuItemCard from '@/components/ui/MenuItemCard';
import {
  FiSearch,
  FiTruck,
  FiClock,
  FiStar,
  FiArrowRight,
  FiMapPin,
} from 'react-icons/fi';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const restaurants = useAppSelector(selectRestaurants);
  const popularItems = useAppSelector(selectPopularItems);
  const isLoading = useAppSelector(selectRestaurantLoading);
  const language = useAppSelector(selectLanguage);

  const isArabic = language === 'ar';

  useEffect(() => {
    // Fetch featured restaurants and popular items
    dispatch(fetchRestaurants({ limit: 6, sortBy: 'rating', sortOrder: 'desc' }));
    dispatch(fetchPopularItems(8));
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: isArabic ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left rtl:lg:text-right"
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                {isArabic ? (
                  <>
                    أفضل الأطعمة في
                    <br />
                    <span className="text-accent-300">أسوان</span>
                  </>
                ) : (
                  <>
                    Best Food in
                    <br />
                    <span className="text-accent-300">Aswan</span>
                  </>
                )}
              </h1>
              
              <p className="text-xl lg:text-2xl mb-8 text-primary-100">
                {isArabic 
                  ? 'اكتشف أشهى الأطعمة من المطاعم المحلية واستمتع بتوصيل سريع وموثوق'
                  : 'Discover delicious food from local restaurants with fast and reliable delivery'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start rtl:lg:justify-end">
                <Link
                  to="/restaurants"
                  className="btn btn-lg bg-white text-primary-600 hover:bg-primary-50 px-8"
                >
                  {isArabic ? 'تصفح المطاعم' : 'Browse Restaurants'}
                </Link>
                <Link
                  to="/restaurants?search="
                  className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8"
                >
                  <FiSearch className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
                  {isArabic ? 'ابحث عن طعامك' : 'Search Food'}
                </Link>
              </div>
            </motion.div>

            {/* Hero Image/Stats */}
            <motion.div
              initial={{ opacity: 0, x: isArabic ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <FiTruck className="h-8 w-8 mx-auto mb-3 text-accent-300" />
                  <h3 className="text-2xl font-bold mb-1">50+</h3>
                  <p className="text-primary-100 text-sm">
                    {isArabic ? 'مطعم محلي' : 'Local Restaurants'}
                  </p>
                </div>
                
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <FiClock className="h-8 w-8 mx-auto mb-3 text-accent-300" />
                  <h3 className="text-2xl font-bold mb-1">30</h3>
                  <p className="text-primary-100 text-sm">
                    {isArabic ? 'دقيقة توصيل' : 'Min Delivery'}
                  </p>
                </div>
                
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <FiStar className="h-8 w-8 mx-auto mb-3 text-accent-300" />
                  <h3 className="text-2xl font-bold mb-1">4.8</h3>
                  <p className="text-primary-100 text-sm">
                    {isArabic ? 'تقييم العملاء' : 'Customer Rating'}
                  </p>
                </div>
                
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <FiMapPin className="h-8 w-8 mx-auto mb-3 text-accent-300" />
                  <h3 className="text-2xl font-bold mb-1">24/7</h3>
                  <p className="text-primary-100 text-sm">
                    {isArabic ? 'خدمة متاحة' : 'Service Available'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
              {isArabic ? 'الأطباق الشائعة' : 'Popular Dishes'}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {isArabic 
                ? 'اكتشف أشهى الأطباق التي يحبها عملاؤنا من مختلف المطاعم في أسوان'
                : 'Discover the most loved dishes by our customers from various restaurants in Aswan'
              }
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-32 bg-neutral-200 rounded-t-xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                    <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : popularItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {popularItems.map((item, index) => (
                <MenuItemCard
                  key={item.id}
                  menuItem={item}
                  index={index}
                  showRestaurantName={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-500">
                {isArabic ? 'لا توجد أطباق شائعة حالياً' : 'No popular dishes available'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
                {isArabic ? 'المطاعم المميزة' : 'Featured Restaurants'}
              </h2>
              <p className="text-lg text-neutral-600">
                {isArabic 
                  ? 'أفضل المطاعم في أسوان مع أعلى التقييمات'
                  : 'Top-rated restaurants in Aswan with excellent reviews'
                }
              </p>
            </div>
            <Link
              to="/restaurants"
              className="btn btn-outline flex items-center space-x-2 rtl:space-x-reverse"
            >
              <span>{isArabic ? 'عرض الكل' : 'View All'}</span>
              <FiArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-neutral-200 rounded-t-xl"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                    <div className="flex space-x-4 rtl:space-x-reverse">
                      <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-500">
                {isArabic ? 'لا توجد مطاعم متاحة حالياً' : 'No restaurants available'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
              {isArabic ? 'كيف يعمل التطبيق؟' : 'How It Works?'}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {isArabic 
                ? 'ثلاث خطوات بسيطة للحصول على طعامك المفضل'
                : 'Three simple steps to get your favorite food'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                icon: FiSearch,
                title: isArabic ? 'ابحث واختر' : 'Search & Choose',
                description: isArabic 
                  ? 'ابحث عن مطعمك المفضل واختر من قائمة متنوعة من الأطعمة'
                  : 'Search for your favorite restaurant and choose from a variety of foods',
              },
              {
                step: 2,
                icon: FiTruck,
                title: isArabic ? 'اطلب وادفع' : 'Order & Pay',
                description: isArabic 
                  ? 'أضف الأطعمة لسلتك وادفع بطريقة آمنة ومريحة'
                  : 'Add food to your cart and pay securely and conveniently',
              },
              {
                step: 3,
                icon: FiStar,
                title: isArabic ? 'استقبل واستمتع' : 'Receive & Enjoy',
                description: isArabic 
                  ? 'استقبل طلبك في الوقت المحدد واستمتع بوجبتك اللذيذة'
                  : 'Receive your order on time and enjoy your delicious meal',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2 w-8 h-8 bg-accent-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {isArabic ? 'جربها الآن!' : 'Try It Now!'}
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              {isArabic 
                ? 'انضم لآلاف العملاء الذين يثقون في خدمتنا كل يوم'
                : 'Join thousands of customers who trust our service every day'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn btn-lg bg-white text-primary-600 hover:bg-primary-50 px-8"
              >
                {isArabic ? 'إنشاء حساب جديد' : 'Create New Account'}
              </Link>
              <Link
                to="/restaurants"
                className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8"
              >
                {isArabic ? 'ابدأ الطلب الآن' : 'Start Ordering Now'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;