import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchOrders,
  selectOrders,
  selectActiveOrders,
  selectCompletedOrders,
  selectOrderLoading,
} from '@/store/slices/orderSlice';
import { selectLanguage } from '@/store/slices/uiSlice';
import { OrderStatus } from '@/types';
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiArrowRight,
  FiFilter,
} from 'react-icons/fi';

const OrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const activeOrders = useAppSelector(selectActiveOrders);
  const completedOrders = useAppSelector(selectCompletedOrders);
  const isLoading = useAppSelector(selectOrderLoading);
  const language = useAppSelector(selectLanguage);

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const isArabic = language === 'ar';

  useEffect(() => {
    dispatch(fetchOrders({}));
  }, [dispatch]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <FiClock className="h-4 w-4 text-yellow-500" />;
      case OrderStatus.CONFIRMED:
        return <FiCheckCircle className="h-4 w-4 text-blue-500" />;
      case OrderStatus.PREPARING:
        return <FiPackage className="h-4 w-4 text-orange-500" />;
      case OrderStatus.OUT_FOR_DELIVERY:
        return <FiTruck className="h-4 w-4 text-purple-500" />;
      case OrderStatus.DELIVERED:
        return <FiCheckCircle className="h-4 w-4 text-green-500" />;
      case OrderStatus.CANCELLED:
        return <FiXCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FiPackage className="h-4 w-4 text-neutral-500" />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    const statusMap = {
      [OrderStatus.PENDING]: { ar: 'في الانتظار', en: 'Pending' },
      [OrderStatus.CONFIRMED]: { ar: 'مؤكد', en: 'Confirmed' },
      [OrderStatus.PREPARING]: { ar: 'قيد التحضير', en: 'Preparing' },
      [OrderStatus.READY_FOR_PICKUP]: { ar: 'جاهز للاستلام', en: 'Ready' },
      [OrderStatus.OUT_FOR_DELIVERY]: { ar: 'في الطريق', en: 'Out for Delivery' },
      [OrderStatus.DELIVERED]: { ar: 'تم التوصيل', en: 'Delivered' },
      [OrderStatus.CANCELLED]: { ar: 'ملغي', en: 'Cancelled' },
    };
    return isArabic ? statusMap[status]?.ar : statusMap[status]?.en;
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.PREPARING:
        return 'bg-orange-100 text-orange-800';
      case OrderStatus.READY_FOR_PICKUP:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const filteredOrders = () => {
    let ordersList = orders;

    switch (activeTab) {
      case 'active':
        ordersList = activeOrders;
        break;
      case 'completed':
        ordersList = completedOrders;
        break;
      default:
        ordersList = orders;
    }

    if (statusFilter) {
      ordersList = ordersList.filter(order => order.status === statusFilter);
    }

    return ordersList;
  };

  const displayedOrders = filteredOrders();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-2">
            {isArabic ? 'طلباتي' : 'My Orders'}
          </h1>
          <p className="text-neutral-600">
            {isArabic 
              ? 'تتبع جميع طلباتك وحالتها الحالية'
              : 'Track all your orders and their current status'
            }
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex items-center space-x-1 rtl:space-x-reverse bg-white rounded-lg p-1 shadow-soft">
            {[
              { key: 'all', label: isArabic ? 'جميع الطلبات' : 'All Orders', count: orders.length },
              { key: 'active', label: isArabic ? 'الطلبات النشطة' : 'Active Orders', count: activeOrders.length },
              { key: 'completed', label: isArabic ? 'الطلبات المكتملة' : 'Completed Orders', count: completedOrders.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 rtl:ml-0 rtl:mr-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center space-x-4 rtl:space-x-reverse">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <FiFilter className="h-4 w-4 text-neutral-500" />
            <span className="text-sm text-neutral-600">
              {isArabic ? 'فلترة حسب الحالة:' : 'Filter by status:'}
            </span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
            className="input text-sm py-1 px-2 min-w-0"
          >
            <option value="">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
            {Object.values(OrderStatus).map((status) => (
              <option key={status} value={status}>
                {getStatusText(status)}
              </option>
            ))}
          </select>

          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {isArabic ? 'إلغاء الفلتر' : 'Clear Filter'}
            </button>
          )}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
                  <div className="h-6 bg-neutral-200 rounded w-1/6"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedOrders.length > 0 ? (
          <div className="space-y-4">
            {displayedOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right rtl:text-left">
                    <p className="text-sm font-medium text-neutral-800">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Restaurant */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">
                      {isArabic ? 'المطعم' : 'Restaurant'}
                    </p>
                    <p className="font-medium text-neutral-800">
                      {isArabic ? order.restaurant?.nameAr : order.restaurant?.name}
                    </p>
                  </div>

                  {/* Items Count */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">
                      {isArabic ? 'العناصر' : 'Items'}
                    </p>
                    <p className="font-medium text-neutral-800">
                      {order.items?.length || 0} {isArabic ? 'عنصر' : 'items'}
                    </p>
                  </div>

                  {/* Total */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">
                      {isArabic ? 'المجموع' : 'Total'}
                    </p>
                    <p className="font-semibold text-neutral-800">
                      {order.total} {isArabic ? 'ج.م' : 'EGP'}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">
                      {isArabic ? 'طريقة الدفع' : 'Payment'}
                    </p>
                    <p className="font-medium text-neutral-800">
                      {order.paymentMethod === 'CASH' 
                        ? (isArabic ? 'نقدي' : 'Cash')
                        : (isArabic ? 'بطاقة' : 'Card')
                      }
                    </p>
                  </div>
                </div>

                {/* Address */}
                {order.address && (
                  <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-500 mb-1">
                      {isArabic ? 'عنوان التوصيل' : 'Delivery Address'}
                    </p>
                    <p className="text-sm text-neutral-700">
                      {order.address.address}
                    </p>
                  </div>
                )}

                {/* Estimated Delivery Time */}
                {order.estimatedDeliveryTime && order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
                  <div className="mb-4 flex items-center space-x-2 rtl:space-x-reverse text-sm text-neutral-600">
                    <FiClock className="h-4 w-4" />
                    <span>
                      {isArabic ? 'الوصول المتوقع:' : 'Expected delivery:'} {' '}
                      {new Date(order.estimatedDeliveryTime).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <Link
                    to={`/orders/${order.id}`}
                    className="btn btn-outline btn-sm flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <span>{isArabic ? 'عرض التفاصيل' : 'View Details'}</span>
                    <FiArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
                  </Link>

                  {/* Reorder Button */}
                  {order.status === OrderStatus.DELIVERED && (
                    <button className="btn btn-primary btn-sm">
                      {isArabic ? 'إعادة الطلب' : 'Reorder'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="h-12 w-12 text-neutral-400" />
            </div>
            
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              {isArabic ? 'لا توجد طلبات' : 'No orders found'}
            </h3>
            
            <p className="text-neutral-500 mb-6">
              {statusFilter
                ? (isArabic ? 'لا توجد طلبات بهذه الحالة' : 'No orders with this status')
                : (isArabic ? 'لم تقم بأي طلبات بعد' : "You haven't placed any orders yet")
              }
            </p>

            <div className="space-y-3">
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter('')}
                  className="btn btn-outline"
                >
                  {isArabic ? 'عرض جميع الطلبات' : 'Show All Orders'}
                </button>
              )}
              
              <Link
                to="/restaurants"
                className="btn btn-primary"
              >
                {isArabic ? 'ابدأ الطلب الآن' : 'Start Ordering Now'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;