import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectCart,
  selectCartItems,
  selectCartItemsCount,
  selectCartTotal,
  selectCartIsEmpty,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from '@/store/slices/cartSlice';
import { selectLanguage } from '@/store/slices/uiSlice';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import {
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiArrowRight,
  FiArrowLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cart = useAppSelector(selectCart);
  const cartItems = useAppSelector(selectCartItems);
  const cartItemsCount = useAppSelector(selectCartItemsCount);
  const cartTotal = useAppSelector(selectCartTotal);
  const isEmpty = useAppSelector(selectCartIsEmpty);
  const language = useAppSelector(selectLanguage);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isArabic = language === 'ar';

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
      toast.error(
        isArabic 
          ? 'يجب تسجيل الدخول أولاً'
          : 'Please login first'
      );
      navigate('/login');
      return;
    }
    
    navigate('/checkout');
  };

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-32 h-32 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingCart className="h-16 w-16 text-neutral-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">
              {isArabic ? 'السلة فارغة' : 'Your cart is empty'}
            </h1>
            
            <p className="text-neutral-600 mb-8 leading-relaxed">
              {isArabic 
                ? 'يبدو أنك لم تضف أي أطعمة إلى سلتك بعد. ابدأ بتصفح المطاعم واختر ما يعجبك!'
                : "Looks like you haven't added any food to your cart yet. Start browsing restaurants and pick what you like!"
              }
            </p>

            <div className="space-y-4">
              <Link
                to="/restaurants"
                className="btn btn-primary w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <FiShoppingCart className="h-5 w-5" />
                <span>{isArabic ? 'تصفح المطاعم' : 'Browse Restaurants'}</span>
              </Link>
              
              <Link
                to="/"
                className="btn btn-outline w-full"
              >
                {isArabic ? 'العودة للرئيسية' : 'Back to Home'}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">
              {isArabic ? 'سلة التسوق' : 'Shopping Cart'}
            </h1>
            <p className="text-neutral-600 mt-1">
              {cartItemsCount} {isArabic ? 'عنصر في السلة' : 'items in cart'}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline flex items-center space-x-2 rtl:space-x-reverse"
          >
            <FiArrowLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
            <span>{isArabic ? 'رجوع' : 'Back'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Restaurant Info */}
            {cart.restaurant && (
              <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-800">
                      {isArabic ? cart.restaurant.nameAr : cart.restaurant.name}
                    </h2>
                    <p className="text-sm text-neutral-500">
                      {isArabic ? 'وقت التوصيل:' : 'Delivery time:'} {cart.restaurant.deliveryTime} {isArabic ? 'دقيقة' : 'min'}
                    </p>
                  </div>
                  <Link
                    to={`/restaurants/${cart.restaurant.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {isArabic ? 'عرض المطعم' : 'View Restaurant'}
                  </Link>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.menuItemId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-soft p-6"
                >
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.menuItem.image ? (
                        <img
                          src={item.menuItem.image}
                          alt={isArabic ? item.menuItem.nameAr : item.menuItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                          <span className="text-primary-600 text-lg font-bold">
                            {isArabic ? item.menuItem.nameAr.charAt(0) : item.menuItem.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-800 mb-1">
                        {isArabic ? item.menuItem.nameAr : item.menuItem.name}
                      </h3>
                      
                      <p className="text-sm text-neutral-500 mb-2">
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
                        <p className="text-xs text-neutral-500 mb-3 bg-neutral-50 rounded p-2">
                          <span className="font-medium">{isArabic ? 'ملاحظات:' : 'Notes:'}</span> {item.notes}
                        </p>
                      )}

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <button
                            onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <FiMinus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-lg">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                          >
                            <FiPlus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <span className="font-semibold text-lg text-neutral-800">
                            {((item.menuItem.discountPrice || item.menuItem.price) * item.quantity).toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}
                          </span>
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
                </motion.div>
              ))}
            </div>

            {/* Clear Cart */}
            <div className="text-center pt-4">
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                {isArabic ? 'إفراغ السلة' : 'Clear Cart'}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-soft p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-neutral-800 mb-6">
                {isArabic ? 'ملخص الطلب' : 'Order Summary'}
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-600">{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span className="font-medium">{cart.subtotal.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-600">{isArabic ? 'رسوم التوصيل:' : 'Delivery fee:'}</span>
                  <span className="font-medium">
                    {cart.deliveryFee === 0 
                      ? (isArabic ? 'مجاني' : 'Free')
                      : `${cart.deliveryFee.toFixed(2)} ${isArabic ? 'ج.م' : 'EGP'}`
                    }
                  </span>
                </div>

                {cart.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">{isArabic ? 'الضرائب:' : 'Tax:'}</span>
                    <span className="font-medium">{cart.tax.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}</span>
                  </div>
                )}

                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{isArabic ? 'الخصم:' : 'Discount:'}</span>
                    <span className="font-medium">-{cart.discount.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}</span>
                  </div>
                )}

                <hr className="my-4" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>{isArabic ? 'المجموع:' : 'Total:'}</span>
                  <span>{cartTotal.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}</span>
                </div>
              </div>

              {/* Minimum Order Check */}
              {cart.restaurant && cart.subtotal < cart.restaurant.minimumOrder && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm">
                    {isArabic 
                      ? `الحد الأدنى للطلب هو ${cart.restaurant.minimumOrder} جنيه`
                      : `Minimum order is ${cart.restaurant.minimumOrder} EGP`
                    }
                  </p>
                  <p className="text-yellow-600 text-xs mt-1">
                    {isArabic 
                      ? `أضف ${(cart.restaurant.minimumOrder - cart.subtotal).toFixed(2)} جنيه أخرى`
                      : `Add ${(cart.restaurant.minimumOrder - cart.subtotal).toFixed(2)} EGP more`
                    }
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.restaurant && cart.subtotal < cart.restaurant.minimumOrder}
                className="btn btn-primary w-full flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isArabic ? 'إتمام الطلب' : 'Proceed to Checkout'}</span>
                <FiArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
              </button>

              {/* Continue Shopping */}
              <Link
                to="/restaurants"
                className="btn btn-outline w-full mt-3"
              >
                {isArabic ? 'متابعة التسوق' : 'Continue Shopping'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;