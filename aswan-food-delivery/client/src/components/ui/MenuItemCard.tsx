import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MenuItem } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart } from '@/store/slices/cartSlice';
import { selectLanguage } from '@/store/slices/uiSlice';
import {
  FiPlus,
  FiClock,
  FiStar,
  FiInfo,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface MenuItemCardProps {
  menuItem: MenuItem;
  index?: number;
  showRestaurantName?: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  menuItem, 
  index = 0,
  showRestaurantName = false 
}) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  const isArabic = language === 'ar';

  const handleAddToCart = () => {
    dispatch(addToCart({
      menuItem,
      quantity,
      notes: notes.trim() || undefined,
    }));

    toast.success(
      isArabic 
        ? `تم إضافة ${menuItem.nameAr} إلى السلة`
        : `${menuItem.name} added to cart`
    );

    // Reset form
    setNotes('');
    setQuantity(1);
    setShowDetails(false);
  };

  const currentPrice = menuItem.discountPrice || menuItem.price;
  const hasDiscount = menuItem.discountPrice && menuItem.discountPrice < menuItem.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`card-hover overflow-hidden ${!menuItem.isAvailable ? 'opacity-60' : ''}`}
    >
      <div className="flex">
        {/* Item Image */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-neutral-200 overflow-hidden flex-shrink-0">
          {menuItem.image ? (
            <img
              src={menuItem.image}
              alt={isArabic ? menuItem.nameAr : menuItem.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
              <span className="text-primary-600 text-lg font-bold">
                {isArabic ? menuItem.nameAr.charAt(0) : menuItem.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Popular Badge */}
          {menuItem.isPopular && (
            <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2">
              <div className="bg-accent-500 text-white px-1.5 py-0.5 rounded text-xs font-medium flex items-center space-x-1 rtl:space-x-reverse">
                <FiStar className="h-3 w-3" />
                <span>{isArabic ? 'شائع' : 'Popular'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            {/* Restaurant Name */}
            {showRestaurantName && menuItem.restaurant && (
              <p className="text-xs text-primary-600 font-medium mb-1">
                {isArabic ? menuItem.restaurant.nameAr : menuItem.restaurant.name}
              </p>
            )}

            {/* Item Name */}
            <h3 className="font-semibold text-neutral-800 mb-1">
              {isArabic ? menuItem.nameAr : menuItem.name}
            </h3>

            {/* Description */}
            {(menuItem.description || menuItem.descriptionAr) && (
              <p className="text-sm text-neutral-500 mb-2 line-clamp-2">
                {isArabic ? menuItem.descriptionAr : menuItem.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
              <span className="font-semibold text-lg text-neutral-800">
                {currentPrice} {isArabic ? 'ج.م' : 'EGP'}
              </span>
              {hasDiscount && (
                <span className="text-sm text-neutral-400 line-through">
                  {menuItem.price} {isArabic ? 'ج.م' : 'EGP'}
                </span>
              )}
              {hasDiscount && (
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                  {Math.round(((menuItem.price - menuItem.discountPrice!) / menuItem.price) * 100)}% {isArabic ? 'خصم' : 'OFF'}
                </span>
              )}
            </div>

            {/* Additional Info */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse text-xs text-neutral-500">
              {menuItem.preparationTime && (
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <FiClock className="h-3 w-3" />
                  <span>{menuItem.preparationTime} {isArabic ? 'د' : 'min'}</span>
                </div>
              )}
              {menuItem.calories && (
                <span>{menuItem.calories} {isArabic ? 'سعرة' : 'cal'}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3">
            {/* Info Button */}
            {(menuItem.ingredients || menuItem.allergens) && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                title={isArabic ? 'تفاصيل أكثر' : 'More details'}
              >
                <FiInfo className="h-4 w-4" />
              </button>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={() => setShowDetails(true)}
              disabled={!menuItem.isAvailable}
              className={`btn btn-primary btn-sm flex items-center space-x-2 rtl:space-x-reverse ${
                !menuItem.isAvailable ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FiPlus className="h-4 w-4" />
              <span>
                {!menuItem.isAvailable
                  ? (isArabic ? 'غير متاح' : 'Unavailable')
                  : (isArabic ? 'إضافة' : 'Add')
                }
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-neutral-200 p-4 bg-neutral-50"
        >
          {/* Ingredients & Allergens */}
          {(menuItem.ingredients || menuItem.allergens) && (
            <div className="mb-4 space-y-2">
              {menuItem.ingredients && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">
                    {isArabic ? 'المكونات:' : 'Ingredients:'}
                  </h4>
                  <p className="text-sm text-neutral-600">{menuItem.ingredients}</p>
                </div>
              )}
              {menuItem.allergens && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">
                    {isArabic ? 'مسببات الحساسية:' : 'Allergens:'}
                  </h4>
                  <p className="text-sm text-red-600">{menuItem.allergens}</p>
                </div>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {isArabic ? 'الكمية:' : 'Quantity:'}
            </label>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-neutral-300 transition-colors"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-neutral-300 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {isArabic ? 'ملاحظات خاصة (اختيارية):' : 'Special notes (optional):'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isArabic ? 'أي طلبات خاصة...' : 'Any special requests...'}
              className="input w-full h-20 resize-none"
              maxLength={200}
            />
            <p className="text-xs text-neutral-400 mt-1">
              {notes.length}/200
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={() => setShowDetails(false)}
              className="btn btn-outline btn-sm flex-1"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!menuItem.isAvailable}
              className="btn btn-primary btn-sm flex-1"
            >
              {isArabic ? `إضافة ${quantity} إلى السلة` : `Add ${quantity} to Cart`}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MenuItemCard;