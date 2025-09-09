import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchRestaurantMenu,
  clearCurrentRestaurant,
  selectCurrentRestaurant,
  selectMenuLoading,
  selectRestaurantError,
} from '@/store/slices/restaurantSlice';
import { selectLanguage } from '@/store/slices/uiSlice';
import MenuItemCard from '@/components/ui/MenuItemCard';
import LoadingScreen from '@/components/ui/LoadingScreen';
import {
  FiStar,
  FiClock,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiArrowLeft,
  FiShare2,
  FiHeart,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const restaurant = useAppSelector(selectCurrentRestaurant);
  const isLoading = useAppSelector(selectMenuLoading);
  const error = useAppSelector(selectRestaurantError);
  const language = useAppSelector(selectLanguage);

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);

  const isArabic = language === 'ar';

  useEffect(() => {
    if (id) {
      dispatch(fetchRestaurantMenu(id));
    }

    return () => {
      dispatch(clearCurrentRestaurant());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (restaurant?.categories && restaurant.categories.length > 0) {
      setActiveCategory(restaurant.categories[0].id);
    }
  }, [restaurant]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isArabic ? restaurant?.nameAr : restaurant?.name,
          text: isArabic ? restaurant?.descriptionAr : restaurant?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success(isArabic ? 'تم نسخ الرابط' : 'Link copied');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(
      isFavorite
        ? (isArabic ? 'تم إزالة من المفضلة' : 'Removed from favorites')
        : (isArabic ? 'تم إضافة للمفضلة' : 'Added to favorites')
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">
            {isArabic ? 'المطعم غير موجود' : 'Restaurant not found'}
          </h2>
          <p className="text-neutral-600 mb-6">
            {isArabic 
              ? 'عذراً، لا يمكن العثور على هذا المطعم'
              : 'Sorry, we could not find this restaurant'
            }
          </p>
          <Link to="/restaurants" className="btn btn-primary">
            {isArabic ? 'العودة للمطاعم' : 'Back to Restaurants'}
          </Link>
        </div>
      </div>
    );
  }

  const activeMenuItems = restaurant.categories?.find(cat => cat.id === activeCategory)?.menuItems || [];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Restaurant Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 md:h-80 bg-neutral-200 relative overflow-hidden">
          {restaurant.coverImage || restaurant.image ? (
            <img
              src={restaurant.coverImage || restaurant.image}
              alt={isArabic ? restaurant.nameAr : restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-white text-6xl font-bold">
                {isArabic ? restaurant.nameAr.charAt(0) : restaurant.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>

          {/* Back Button */}
          <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
            <Link
              to="/restaurants"
              className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-neutral-700 hover:bg-opacity-100 transition-colors"
            >
              <FiArrowLeft className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 flex space-x-2 rtl:space-x-reverse">
            <button
              onClick={handleShare}
              className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-neutral-700 hover:bg-opacity-100 transition-colors"
            >
              <FiShare2 className="h-5 w-5" />
            </button>
            <button
              onClick={toggleFavorite}
              className={`w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-colors ${
                isFavorite ? 'text-red-500' : 'text-neutral-700'
              }`}
            >
              <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Status Badge */}
          <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              restaurant.isOpen
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {restaurant.isOpen
                ? (isArabic ? 'مفتوح الآن' : 'Open Now')
                : (isArabic ? 'مغلق' : 'Closed')
              }
            </span>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="bg-white shadow-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-2">
                  {isArabic ? restaurant.nameAr : restaurant.name}
                </h1>
                
                {restaurant.description && (
                  <p className="text-neutral-600 mb-4 leading-relaxed">
                    {isArabic ? restaurant.descriptionAr : restaurant.description}
                  </p>
                )}

                {/* Rating & Reviews */}
                {restaurant.rating > 0 && (
                  <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <FiStar className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-semibold text-neutral-800">
                        {restaurant.rating.toFixed(1)}
                      </span>
                      <span className="text-neutral-500">
                        ({restaurant.totalReviews} {isArabic ? 'تقييم' : 'reviews'})
                      </span>
                    </div>
                  </div>
                )}

                {/* Address & Contact */}
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <FiMapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <FiPhone className="h-4 w-4 flex-shrink-0" />
                    <a href={`tel:${restaurant.phone}`} className="hover:text-primary-600">
                      {restaurant.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-neutral-50 rounded-xl p-4 lg:w-80">
                <h3 className="font-semibold text-neutral-800 mb-3">
                  {isArabic ? 'معلومات التوصيل' : 'Delivery Info'}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-neutral-600">
                      <FiClock className="h-4 w-4" />
                      <span>{isArabic ? 'وقت التوصيل' : 'Delivery time'}</span>
                    </div>
                    <span className="font-medium">{restaurant.deliveryTime} {isArabic ? 'دقيقة' : 'min'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-neutral-600">
                      <FiTruck className="h-4 w-4" />
                      <span>{isArabic ? 'رسوم التوصيل' : 'Delivery fee'}</span>
                    </div>
                    <span className="font-medium">
                      {restaurant.deliveryFee === 0
                        ? (isArabic ? 'مجاني' : 'Free')
                        : `${restaurant.deliveryFee} ${isArabic ? 'ج.م' : 'EGP'}`
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">{isArabic ? 'الحد الأدنى' : 'Minimum order'}</span>
                    <span className="font-medium">{restaurant.minimumOrder} {isArabic ? 'ج.م' : 'EGP'}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">{isArabic ? 'ساعات العمل' : 'Working hours'}</span>
                    <span className="font-medium">{restaurant.openingTime} - {restaurant.closingTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          {restaurant.categories && restaurant.categories.length > 0 && (
            <div className="lg:w-64">
              <div className="bg-white rounded-xl shadow-soft p-4 sticky top-24">
                <h3 className="font-semibold text-neutral-800 mb-4">
                  {isArabic ? 'الفئات' : 'Categories'}
                </h3>
                <nav className="space-y-1">
                  {restaurant.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left rtl:text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeCategory === category.id
                          ? 'bg-primary-100 text-primary-800 font-medium'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
                      }`}
                    >
                      {isArabic ? category.nameAr : category.name}
                      {category.menuItems && (
                        <span className="ml-2 rtl:ml-0 rtl:mr-2 text-xs text-neutral-400">
                          ({category.menuItems.length})
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="flex-1">
            {restaurant.categories && restaurant.categories.length > 0 ? (
              <div>
                {/* Category Header */}
                {restaurant.categories.find(cat => cat.id === activeCategory) && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                      {isArabic 
                        ? restaurant.categories.find(cat => cat.id === activeCategory)?.nameAr
                        : restaurant.categories.find(cat => cat.id === activeCategory)?.name
                      }
                    </h2>
                    {restaurant.categories.find(cat => cat.id === activeCategory)?.description && (
                      <p className="text-neutral-600">
                        {restaurant.categories.find(cat => cat.id === activeCategory)?.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Menu Items Grid */}
                {activeMenuItems.length > 0 ? (
                  <div className="space-y-4">
                    {activeMenuItems.map((item, index) => (
                      <MenuItemCard
                        key={item.id}
                        menuItem={item}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-neutral-500">
                      {isArabic ? 'لا توجد عناصر في هذه الفئة' : 'No items in this category'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-500">
                  {isArabic ? 'لا توجد قائمة متاحة' : 'No menu available'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section (Placeholder) */}
      {restaurant.reviews && restaurant.reviews.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-neutral-800 mb-8">
              {isArabic ? 'آراء العملاء' : 'Customer Reviews'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurant.reviews.slice(0, 6).map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-neutral-50 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-neutral-500">
                      {new Date(review.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-neutral-700 text-sm mb-3 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {review.user?.firstName?.charAt(0) || 'ع'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-neutral-800">
                      {review.isAnonymous 
                        ? (isArabic ? 'عميل مجهول' : 'Anonymous')
                        : `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim()
                      }
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;