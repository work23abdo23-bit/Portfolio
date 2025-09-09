import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchOrderById,
  cancelOrder,
  selectCurrentOrder,
  selectOrderLoading,
} from '@/store/slices/orderSlice';
import { selectLanguage } from '@/store/slices/uiSlice';
import { OrderStatus } from '@/types';
import LoadingScreen from '@/components/ui/LoadingScreen';
import OrderTracking from '@/components/ui/OrderTracking';
import { useSocket } from '@/hooks/useSocket';
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiArrowLeft,
  FiStar,
  FiMessageCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectCurrentOrder);
  const isLoading = useAppSelector(selectOrderLoading);
  const language = useAppSelector(selectLanguage);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const isArabic = language === 'ar';
  
  // Initialize socket connection
  useSocket();

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [id, dispatch]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <FiClock className="h-6 w-6 text-yellow-500" />;
      case OrderStatus.CONFIRMED:
        return <FiCheckCircle className="h-6 w-6 text-blue-500" />;
      case OrderStatus.PREPARING:
        return <FiPackage className="h-6 w-6 text-orange-500" />;
      case OrderStatus.OUT_FOR_DELIVERY:
        return <FiTruck className="h-6 w-6 text-purple-500" />;
      case OrderStatus.DELIVERED:
        return <FiCheckCircle className="h-6 w-6 text-green-500" />;
      case OrderStatus.CANCELLED:
        return <FiXCircle className="h-6 w-6 text-red-500" />;
      default:
        return <FiPackage className="h-6 w-6 text-neutral-500" />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    const statusMap = {
      [OrderStatus.PENDING]: { ar: 'في الانتظار', en: 'Pending' },
      [OrderStatus.CONFIRMED]: { ar: 'مؤكد', en: 'Confirmed' },
      [OrderStatus.PREPARING]: { ar: 'قيد التحضير', en: 'Preparing' },
      [OrderStatus.READY_FOR_PICKUP]: { ar: 'جاهز للاستلام', en: 'Ready for Pickup' },
      [OrderStatus.OUT_FOR_DELIVERY]: { ar: 'في الطريق للتوصيل', en: 'Out for Delivery' },
      [OrderStatus.DELIVERED]: { ar: 'تم التوصيل', en: 'Delivered' },
      [OrderStatus.CANCELLED]: { ar: 'ملغي', en: 'Cancelled' },
    };
    return isArabic ? statusMap[status]?.ar : statusMap[status]?.en;
  };

  const getStatusDescription = (status: OrderStatus) => {
    const descriptions = {
      [OrderStatus.PENDING]: { 
        ar: 'طلبك في الانتظار، سيتم تأكيده قريباً', 
        en: 'Your order is pending confirmation' 
      },
      [OrderStatus.CONFIRMED]: { 
        ar: 'تم تأكيد طلبك وسيبدأ التحضير قريباً', 
        en: 'Your order has been confirmed and will be prepared soon' 
      },
      [OrderStatus.PREPARING]: { 
        ar: 'يتم تحضير طلبك الآن في المطعم', 
        en: 'Your order is being prepared at the restaurant' 
      },
      [OrderStatus.READY_FOR_PICKUP]: { 
        ar: 'طلبك جاهز وينتظر السائق', 
        en: 'Your order is ready and waiting for pickup' 
      },
      [OrderStatus.OUT_FOR_DELIVERY]: { 
        ar: 'طلبك في الطريق إليك', 
        en: 'Your order is on its way to you' 
      },
      [OrderStatus.DELIVERED]: { 
        ar: 'تم توصيل طلبك بنجاح', 
        en: 'Your order has been delivered successfully' 
      },
      [OrderStatus.CANCELLED]: { 
        ar: 'تم إلغاء الطلب', 
        en: 'Order has been cancelled' 
      },
    };
    return isArabic ? descriptions[status]?.ar : descriptions[status]?.en;
  };

  const handleCancelOrder = async () => {
    if (!order || !cancelReason.trim()) {
      toast.error(isArabic ? 'يرجى كتابة سبب الإلغاء' : 'Please provide a cancellation reason');
      return;
    }

    setIsCancelling(true);
    try {
      const result = await dispatch(cancelOrder({ 
        orderId: order.id, 
        reason: cancelReason.trim() 
      }));
      
      if (cancelOrder.fulfilled.match(result)) {
        toast.success(isArabic ? 'تم إلغاء الطلب' : 'Order cancelled successfully');
        setShowCancelDialog(false);
        setCancelReason('');
      } else {
        toast.error(result.payload || (isArabic ? 'فشل في إلغاء الطلب' : 'Failed to cancel order'));
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancelOrder = order && 
    [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status) &&
    order.createdAt &&
    (Date.now() - new Date(order.createdAt).getTime()) < 5 * 60 * 1000; // 5 minutes

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">
            {isArabic ? 'الطلب غير موجود' : 'Order not found'}
          </h2>
          <p className="text-neutral-600 mb-6">
            {isArabic 
              ? 'عذراً، لا يمكن العثور على هذا الطلب'
              : 'Sorry, we could not find this order'
            }
          </p>
          <Link to="/orders" className="btn btn-primary">
            {isArabic ? 'العودة للطلبات' : 'Back to Orders'}
          </Link>
        </div>
      </div>
    );
  }

  const progressSteps = [
    { status: OrderStatus.PENDING, title: isArabic ? 'تم الطلب' : 'Order Placed' },
    { status: OrderStatus.CONFIRMED, title: isArabic ? 'تم التأكيد' : 'Confirmed' },
    { status: OrderStatus.PREPARING, title: isArabic ? 'قيد التحضير' : 'Preparing' },
    { status: OrderStatus.OUT_FOR_DELIVERY, title: isArabic ? 'في الطريق' : 'On the way' },
    { status: OrderStatus.DELIVERED, title: isArabic ? 'تم التوصيل' : 'Delivered' },
  ];

  const currentStepIndex = progressSteps.findIndex(step => step.status === order.status);
  const isOrderCancelled = order.status === OrderStatus.CANCELLED;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
              <Link
                to="/orders"
                className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <FiArrowLeft className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
              </Link>
              <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">
                {isArabic ? 'تفاصيل الطلب' : 'Order Details'}
              </h1>
            </div>
            <p className="text-neutral-600">
              {isArabic ? 'رقم الطلب:' : 'Order #'} {order.orderNumber}
            </p>
          </div>

          {/* Cancel Order Button */}
          {canCancelOrder && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              {isArabic ? 'إلغاء الطلب' : 'Cancel Order'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Tracking */}
            <OrderTracking order={order} />

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                {isArabic ? 'عناصر الطلب' : 'Order Items'}
              </h3>

              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.menuItem?.image ? (
                        <img
                          src={item.menuItem.image}
                          alt={isArabic ? item.menuItem.nameAr : item.menuItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                          <span className="text-primary-600 text-lg font-bold">
                            {isArabic 
                              ? item.menuItem?.nameAr?.charAt(0) 
                              : item.menuItem?.name?.charAt(0)
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-800">
                        {isArabic ? item.menuItem?.nameAr : item.menuItem?.name}
                      </h4>
                      <p className="text-sm text-neutral-500 mb-2">
                        {isArabic ? 'الكمية:' : 'Quantity:'} {item.quantity} × {item.price} {isArabic ? 'ج.م' : 'EGP'}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-neutral-500 bg-neutral-50 rounded p-2">
                          <span className="font-medium">{isArabic ? 'ملاحظات:' : 'Notes:'}</span> {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right rtl:text-left">
                      <span className="font-semibold text-neutral-800">
                        {(item.quantity * item.price).toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Info */}
            {(order.restaurant || order.driver) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-soft p-6"
              >
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                  {isArabic ? 'معلومات الاتصال' : 'Contact Information'}
                </h3>

                <div className="space-y-4">
                  {/* Restaurant */}
                  {order.restaurant && (
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-neutral-800">
                          {isArabic ? order.restaurant.nameAr : order.restaurant.name}
                        </h4>
                        <p className="text-sm text-neutral-500">
                          {isArabic ? 'المطعم' : 'Restaurant'}
                        </p>
                      </div>
                      {order.restaurant.phone && (
                        <a
                          href={`tel:${order.restaurant.phone}`}
                          className="btn btn-outline btn-sm flex items-center space-x-2 rtl:space-x-reverse"
                        >
                          <FiPhone className="h-4 w-4" />
                          <span>{isArabic ? 'اتصال' : 'Call'}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Driver */}
                  {order.driver && order.status === OrderStatus.OUT_FOR_DELIVERY && (
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-neutral-800">
                          {order.driver.firstName} {order.driver.lastName}
                        </h4>
                        <p className="text-sm text-neutral-500">
                          {isArabic ? 'سائق التوصيل' : 'Delivery Driver'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {order.driver.phone && (
                          <a
                            href={`tel:${order.driver.phone}`}
                            className="btn btn-outline btn-sm flex items-center space-x-2 rtl:space-x-reverse"
                          >
                            <FiPhone className="h-4 w-4" />
                            <span>{isArabic ? 'اتصال' : 'Call'}</span>
                          </a>
                        )}
                        <button className="btn btn-outline btn-sm flex items-center space-x-2 rtl:space-x-reverse">
                          <FiMessageCircle className="h-4 w-4" />
                          <span>{isArabic ? 'رسالة' : 'Message'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-soft p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                {isArabic ? 'ملخص الطلب' : 'Order Summary'}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span>{order.subtotal.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">{isArabic ? 'رسوم التوصيل:' : 'Delivery fee:'}</span>
                  <span>
                    {order.deliveryFee === 0 
                      ? (isArabic ? 'مجاني' : 'Free')
                      : `${order.deliveryFee.toFixed(2)} ${isArabic ? 'ج.م' : 'EGP'}`
                    }
                  </span>
                </div>

                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">{isArabic ? 'الضرائب:' : 'Tax:'}</span>
                    <span>{order.tax.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}</span>
                  </div>
                )}

                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{isArabic ? 'الخصم:' : 'Discount:'}</span>
                    <span>-{order.discount.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-lg font-semibold pt-3 border-t border-neutral-200">
                <span>{isArabic ? 'المجموع:' : 'Total:'}</span>
                <span>{order.total.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}</span>
              </div>

              {/* Payment Method */}
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">{isArabic ? 'طريقة الدفع:' : 'Payment method:'}</span>
                  <span className="font-medium">
                    {order.paymentMethod === 'CASH' 
                      ? (isArabic ? 'نقدي عند التسليم' : 'Cash on Delivery')
                      : (isArabic ? 'بطاقة ائتمان' : 'Credit Card')
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {order.address && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                  {isArabic ? 'عنوان التوصيل' : 'Delivery Address'}
                </h3>

                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <FiMapPin className="h-5 w-5 text-neutral-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-800">{order.address.address}</p>
                    <p className="text-sm text-neutral-500">{order.address.city}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Actions */}
            {order.status === OrderStatus.DELIVERED && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                  {isArabic ? 'إجراءات' : 'Actions'}
                </h3>

                <div className="space-y-3">
                  <button className="btn btn-primary w-full flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <FiStar className="h-4 w-4" />
                    <span>{isArabic ? 'تقييم الطلب' : 'Rate Order'}</span>
                  </button>

                  <button className="btn btn-outline w-full">
                    {isArabic ? 'إعادة الطلب' : 'Reorder'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cancel Order Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                {isArabic ? 'إلغاء الطلب' : 'Cancel Order'}
              </h3>

              <p className="text-neutral-600 mb-4">
                {isArabic 
                  ? 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟'
                  : 'Are you sure you want to cancel this order?'
                }
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {isArabic ? 'سبب الإلغاء:' : 'Reason for cancellation:'}
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={isArabic ? 'اكتب سبب الإلغاء...' : 'Enter cancellation reason...'}
                  className="input w-full h-20 resize-none"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => setShowCancelDialog(false)}
                  className="btn btn-outline flex-1"
                  disabled={isCancelling}
                >
                  {isArabic ? 'تراجع' : 'Cancel'}
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling || !cancelReason.trim()}
                  className="btn bg-red-500 text-white hover:bg-red-600 flex-1 disabled:opacity-50"
                >
                  {isCancelling 
                    ? (isArabic ? 'جاري الإلغاء...' : 'Cancelling...')
                    : (isArabic ? 'إلغاء الطلب' : 'Cancel Order')
                  }
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;