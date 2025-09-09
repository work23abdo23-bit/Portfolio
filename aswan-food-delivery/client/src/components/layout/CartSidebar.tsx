import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  selectCart, 
  selectCartItems, 
  selectCartItemsCount, 
  selectCartTotal,
  removeFromCart,
  updateCartItemQuantity,
  clearCart
} from '@/store/slices/cartSlice';
import { setCartSidebarOpen, selectLanguage } from '@/store/slices/uiSlice';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import {
  FiX,
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiArrowRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CartSidebarProps {
  isOpen: boolean;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen }) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const cartItems = useAppSelector(selectCartItems);
  const cartItemsCount = useAppSelector(selectCartItemsCount);
  const cartTotal = useAppSelector(selectCartTotal);
  const language = useAppSelector(selectLanguage);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isArabic = language === 'ar';

  const handleClose = () => {
    dispatch(setCartSidebarOpen(false));
  };

  const handleRemoveItem = (menuItemId: string, itemName: string) => {
    dispatch(removeFromCart(menuItemId));
    toast.success(
      isArabic 
        ? `تم حذف ${itemName} من السلة`
        : `${itemName} removed from cart`
    );
  };

  const handleUpdateQuantity = (menuItemId: string, newQuantity: number) => {
    dispatch(updateCartItemQuantity({ menuItemId, quantity: newQuantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success(
      isArabic ? 'تم إفراغ السلة' : 'Cart cleared'
    );
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      handleClose();
      toast.error(
        isArabic 
          ? 'يجب تسجيل الدخول أولاً'
          : 'Please login first'
      );
      return;
    }
    
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: isArabic ? -400 : 400 }}
            animate={{ x: 0 }}
            exit={{ x: isArabic ? -400 : 400 }}
            className={`fixed top-0 ${isArabic ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-white shadow-strong z-50 flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <FiShoppingCart className="h-5 w-5 text-neutral-600" />
                <h2 className="text-lg font-semibold">
                  {isArabic ? 'سلة التسوق' : 'Shopping Cart'}
                </h2>
                {cartItemsCount > 0 && (
                  <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                /* Empty Cart */
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                    <FiShoppingCart className="h-12 w-12 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                    {isArabic ? 'السلة فارغة' : 'Your cart is empty'}
                  </h3>
                  <p className="text-neutral-500 mb-6">
                    {isArabic 
                      ? 'ابدأ بإضافة بعض الأطعمة اللذيذة'
                      : 'Start adding some delicious food'
                    }
                  </p>
                  <Link
                    to="/restaurants"
                    onClick={handleClose}
                    className="btn btn-primary"
                  >
                    {isArabic ? 'تصفح المطاعم' : 'Browse Restaurants'}
                  </Link>
                </div>
              ) : (
                /* Cart Items */
                <div className="p-4 space-y-4">
                  {/* Restaurant Info */}
                  {cart.restaurant && (
                    <div className="bg-neutral-50 rounded-lg p-3 mb-4">
                      <h3 className="font-medium text-neutral-800">
                        {isArabic ? cart.restaurant.nameAr : cart.restaurant.name}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        {isArabic ? 'وقت التوصيل:' : 'Delivery time:'} {cart.restaurant.deliveryTime} {isArabic ? 'دقيقة' : 'min'}
                      </p>
                    </div>
                  )}

                  {/* Cart Items */}
                  {cartItems.map((item) => (
                    <div key={item.menuItemId} className="bg-white border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3 rtl:space-x-reverse">
                        {/* Item Image */}
                        <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.menuItem.image ? (
                            <img
                              src={item.menuItem.image}
                              alt={isArabic ? item.menuItem.nameAr : item.menuItem.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                              <span className="text-neutral-400 text-xs">
                                {isArabic ? 'صورة' : 'Image'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-neutral-800 truncate">
                            {isArabic ? item.menuItem.nameAr : item.menuItem.name}
                          </h4>
                          <p className="text-sm text-neutral-500 mt-1">
                            {item.menuItem.discountPrice ? (
                              <>
                                <span className="font-medium text-primary-600">
                                  {item.menuItem.discountPrice} {isArabic ? 'ج.م' : 'EGP'}
                                </span>
                                <span className="line-through text-neutral-400 mr-2 rtl:mr-0 rtl:ml-2">
                                  {item.menuItem.price} {isArabic ? 'ج.م' : 'EGP'}
                                </span>
                              </>
                            ) : (
                              <span className="font-medium">
                                {item.menuItem.price} {isArabic ? 'ج.م' : 'EGP'}
                              </span>
                            )}
                          </p>

                          {/* Notes */}
                          {item.notes && (
                            <p className="text-xs text-neutral-500 mt-1">
                              {isArabic ? 'ملاحظات:' : 'Notes:'} {item.notes}
                            </p>
                          )}

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <button
                                onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <FiMinus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                              >
                                <FiPlus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item.menuItemId, isArabic ? item.menuItem.nameAr : item.menuItem.name)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Clear Cart Button */}
                  <button
                    onClick={handleClearCart}
                    className="w-full text-center text-red-600 hover:text-red-700 text-sm py-2"
                  >
                    {isArabic ? 'إفراغ السلة' : 'Clear Cart'}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-neutral-200 p-4 space-y-4">
                {/* Order Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                    <span>{cart.subtotal} {isArabic ? 'ج.م' : 'EGP'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isArabic ? 'رسوم التوصيل:' : 'Delivery fee:'}</span>
                    <span>{cart.deliveryFee} {isArabic ? 'ج.م' : 'EGP'}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{isArabic ? 'الخصم:' : 'Discount:'}</span>
                      <span>-{cart.discount} {isArabic ? 'ج.م' : 'EGP'}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>{isArabic ? 'المجموع:' : 'Total:'}</span>
                    <span>{cartTotal} {isArabic ? 'ج.م' : 'EGP'}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  to="/checkout"
                  onClick={handleCheckout}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  <span>{isArabic ? 'إتمام الطلب' : 'Proceed to Checkout'}</span>
                  <FiArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;