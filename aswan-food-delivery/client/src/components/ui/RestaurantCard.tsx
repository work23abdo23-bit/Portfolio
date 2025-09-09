import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Restaurant } from '@/types';
import { useAppSelector } from '@/store';
import { selectLanguage } from '@/store/slices/uiSlice';
import {
  FiStar,
  FiClock,
  FiTruck,
  FiMapPin,
} from 'react-icons/fi';

interface RestaurantCardProps {
  restaurant: Restaurant;
  index?: number;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, index = 0 }) => {
  const language = useAppSelector(selectLanguage);
  const isArabic = language === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="card-hover overflow-hidden"
    >
      <Link to={`/restaurants/${restaurant.id}`} className="block">
        {/* Restaurant Image */}
        <div className="relative h-48 bg-neutral-200 overflow-hidden">
          {restaurant.coverImage || restaurant.image ? (
            <img
              src={restaurant.coverImage || restaurant.image}
              alt={isArabic ? restaurant.nameAr : restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
              <span className="text-primary-600 text-4xl font-bold">
                {isArabic ? restaurant.nameAr.charAt(0) : restaurant.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              restaurant.isOpen
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {restaurant.isOpen
                ? (isArabic ? 'مفتوح' : 'Open')
                : (isArabic ? 'مغلق' : 'Closed')
              }
            </span>
          </div>

          {/* Delivery Time Badge */}
          <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3">
            <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded-lg flex items-center space-x-1 rtl:space-x-reverse text-xs">
              <FiClock className="h-3 w-3" />
              <span>{restaurant.deliveryTime} {isArabic ? 'د' : 'min'}</span>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="p-4">
          {/* Name and Rating */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-neutral-800 truncate">
                {isArabic ? restaurant.nameAr : restaurant.name}
              </h3>
              {restaurant.description && (
                <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                  {isArabic ? restaurant.descriptionAr : restaurant.description}
                </p>
              )}
            </div>
            
            {restaurant.rating > 0 && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse ml-3 rtl:ml-0 rtl:mr-3 flex-shrink-0">
                <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-neutral-700">
                  {restaurant.rating.toFixed(1)}
                </span>
                <span className="text-xs text-neutral-500">
                  ({restaurant.totalReviews})
                </span>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-neutral-500 mb-3">
            <FiMapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>

          {/* Delivery Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Delivery Fee */}
              <div className="flex items-center space-x-1 rtl:space-x-reverse text-neutral-600">
                <FiTruck className="h-4 w-4" />
                <span>
                  {restaurant.deliveryFee === 0
                    ? (isArabic ? 'توصيل مجاني' : 'Free delivery')
                    : `${restaurant.deliveryFee} ${isArabic ? 'ج.م' : 'EGP'}`
                  }
                </span>
              </div>

              {/* Minimum Order */}
              {restaurant.minimumOrder > 0 && (
                <div className="text-neutral-500">
                  {isArabic ? 'الحد الأدنى:' : 'Min:'} {restaurant.minimumOrder} {isArabic ? 'ج.م' : 'EGP'}
                </div>
              )}
            </div>
          </div>

          {/* Categories Preview */}
          {restaurant.categories && restaurant.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {restaurant.categories.slice(0, 3).map((category) => (
                <span
                  key={category.id}
                  className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md text-xs"
                >
                  {isArabic ? category.nameAr : category.name}
                </span>
              ))}
              {restaurant.categories.length > 3 && (
                <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md text-xs">
                  +{restaurant.categories.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default RestaurantCard;