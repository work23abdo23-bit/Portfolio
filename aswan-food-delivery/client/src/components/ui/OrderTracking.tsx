import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Order, OrderStatus } from '@/types';
import { useAppSelector } from '@/store';
import { selectLanguage } from '@/store/slices/uiSlice';
import socketService from '@/services/socketService';
import {
  FiMapPin,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiPackage,
} from 'react-icons/fi';

interface OrderTrackingProps {
  order: Order;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ order }) => {
  const language = useAppSelector(selectLanguage);
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const isArabic = language === 'ar';

  useEffect(() => {
    if (order.status === OrderStatus.OUT_FOR_DELIVERY) {
      const handleDriverLocation = (data: {
        orderId: string;
        orderNumber: string;
        driverLocation: { latitude: number; longitude: number };
        timestamp: string;
      }) => {
        if (data.orderId === order.id) {
          setDriverLocation(data.driverLocation);
        }
      };

      socketService.onDriverLocation(handleDriverLocation);

      return () => {
        socketService.offDriverLocation(handleDriverLocation);
      };
    }
  }, [order.id, order.status]);

  const trackingSteps = [
    {
      status: OrderStatus.PENDING,
      title: isArabic ? 'تم استلام الطلب' : 'Order Received',
      description: isArabic ? 'تم استلام طلبك بنجاح' : 'Your order has been received',
      icon: FiPackage,
      timestamp: order.createdAt,
    },
    {
      status: OrderStatus.CONFIRMED,
      title: isArabic ? 'تم تأكيد الطلب' : 'Order Confirmed',
      description: isArabic ? 'تم تأكيد طلبك من المطعم' : 'Your order has been confirmed by the restaurant',
      icon: FiCheckCircle,
      timestamp: order.confirmedAt,
    },
    {
      status: OrderStatus.PREPARING,
      title: isArabic ? 'جاري التحضير' : 'Being Prepared',
      description: isArabic ? 'يتم تحضير طلبك الآن' : 'Your order is being prepared',
      icon: FiPackage,
      timestamp: order.confirmedAt, // Use confirmed time as preparation start
    },
    {
      status: OrderStatus.OUT_FOR_DELIVERY,
      title: isArabic ? 'في الطريق' : 'Out for Delivery',
      description: isArabic ? 'سائق التوصيل في الطريق إليك' : 'Delivery driver is on the way to you',
      icon: FiTruck,
      timestamp: order.pickedUpAt,
    },
    {
      status: OrderStatus.DELIVERED,
      title: isArabic ? 'تم التوصيل' : 'Delivered',
      description: isArabic ? 'تم توصيل طلبك بنجاح' : 'Your order has been delivered successfully',
      icon: FiCheckCircle,
      timestamp: order.deliveredAt,
    },
  ];

  const currentStepIndex = trackingSteps.findIndex(step => step.status === order.status);
  const isOrderActive = ![OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status);

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
        <FiMapPin className="h-6 w-6 text-primary-500" />
        <h3 className="text-xl font-semibold text-neutral-800">
          {isArabic ? 'تتبع الطلب' : 'Order Tracking'}
        </h3>
      </div>

      {/* Estimated Delivery Time */}
      {order.estimatedDeliveryTime && isOrderActive && (
        <div className="mb-6 p-4 bg-primary-50 rounded-lg">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <FiClock className="h-5 w-5 text-primary-600" />
            <div>
              <p className="font-medium text-primary-800">
                {isArabic ? 'الوصول المتوقع' : 'Expected Delivery'}
              </p>
              <p className="text-primary-600">
                {new Date(order.estimatedDeliveryTime).toLocaleString(isArabic ? 'ar-EG' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Steps */}
      <div className="relative">
        {trackingSteps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const hasTimestamp = step.timestamp && isCompleted;

          return (
            <motion.div
              key={step.status}
              initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start space-x-4 rtl:space-x-reverse pb-8 last:pb-0"
            >
              {/* Timeline Line */}
              {index < trackingSteps.length - 1 && (
                <div className={`absolute top-12 left-6 rtl:left-auto rtl:right-6 w-px h-16 ${
                  isCompleted ? 'bg-primary-500' : 'bg-neutral-200'
                }`} />
              )}

              {/* Step Icon */}
              <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                isCompleted
                  ? 'bg-primary-500 text-white'
                  : isCurrent
                  ? 'bg-primary-100 text-primary-600 border-2 border-primary-500'
                  : 'bg-neutral-100 text-neutral-400'
              }`}>
                <step.icon className="h-6 w-6" />
                
                {/* Current step animation */}
                {isCurrent && isOrderActive && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary-300 animate-ping" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium ${
                    isCompleted ? 'text-neutral-800' : 'text-neutral-500'
                  }`}>
                    {step.title}
                  </h4>
                  
                  {hasTimestamp && (
                    <span className="text-xs text-neutral-500">
                      {new Date(step.timestamp).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                
                <p className={`text-sm ${
                  isCompleted ? 'text-neutral-600' : 'text-neutral-400'
                }`}>
                  {step.description}
                </p>

                {/* Driver Location for Out for Delivery */}
                {step.status === OrderStatus.OUT_FOR_DELIVERY && isCurrent && driverLocation && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <FiTruck className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">
                        {isArabic ? 'السائق في الطريق' : 'Driver is on the way'}
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      {isArabic ? 'آخر تحديث للموقع منذ قليل' : 'Location updated recently'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Driver Contact (when order is out for delivery) */}
      {order.status === OrderStatus.OUT_FOR_DELIVERY && order.driver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <FiTruck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-neutral-800">
                  {order.driver.firstName} {order.driver.lastName}
                </p>
                <p className="text-sm text-neutral-600">
                  {isArabic ? 'سائق التوصيل' : 'Your delivery driver'}
                </p>
              </div>
            </div>

            {order.driver.phone && (
              <a
                href={`tel:${order.driver.phone}`}
                className="btn btn-outline btn-sm"
              >
                {isArabic ? 'اتصال' : 'Call'}
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* Order Delivered */}
      {order.status === OrderStatus.DELIVERED && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 text-center"
        >
          <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h4 className="font-semibold text-green-800 mb-2">
            {isArabic ? 'تم توصيل طلبك!' : 'Order Delivered!'}
          </h4>
          <p className="text-sm text-green-700">
            {isArabic 
              ? 'نتمنى أن تكون قد استمتعت بوجبتك'
              : 'We hope you enjoyed your meal'
            }
          </p>
          {order.deliveredAt && (
            <p className="text-xs text-green-600 mt-2">
              {isArabic ? 'تم التوصيل في:' : 'Delivered at:'} {' '}
              {new Date(order.deliveredAt).toLocaleString(isArabic ? 'ar-EG' : 'en-US')}
            </p>
          )}
        </motion.div>
      )}

      {/* Order Cancelled */}
      {order.status === OrderStatus.CANCELLED && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200 text-center"
        >
          <FiCheckCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h4 className="font-semibold text-red-800 mb-2">
            {isArabic ? 'تم إلغاء الطلب' : 'Order Cancelled'}
          </h4>
          {order.cancellationReason && (
            <p className="text-sm text-red-700">
              {isArabic ? 'السبب:' : 'Reason:'} {order.cancellationReason}
            </p>
          )}
          {order.cancelledAt && (
            <p className="text-xs text-red-600 mt-2">
              {isArabic ? 'تم الإلغاء في:' : 'Cancelled at:'} {' '}
              {new Date(order.cancelledAt).toLocaleString(isArabic ? 'ar-EG' : 'en-US')}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default OrderTracking;