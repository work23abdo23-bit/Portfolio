import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { updateOrderStatus } from '@/store/slices/orderSlice';
import { addNotification } from '@/store/slices/uiSlice';
import socketService from '@/services/socketService';
import { OrderUpdate } from '@/types';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !isConnectedRef.current) {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
        isConnectedRef.current = true;

        // Set up order update listener
        const handleOrderUpdate = (update: OrderUpdate) => {
          dispatch(updateOrderStatus({
            orderId: update.orderId,
            status: update.status,
            estimatedDeliveryTime: update.estimatedDeliveryTime,
          }));

          // Show notification
          toast.success(update.messageAr || update.message, {
            duration: 5000,
          });
        };

        // Set up notification listener
        const handleNotification = (notification: any) => {
          dispatch(addNotification({
            type: 'info',
            title: notification.titleAr || notification.title,
            message: notification.messageAr || notification.message,
            duration: 6000,
          }));
        };

        socketService.onOrderUpdate(handleOrderUpdate);
        socketService.onNotification(handleNotification);

        // Cleanup function
        return () => {
          socketService.offOrderUpdate(handleOrderUpdate);
          socketService.offNotification(handleNotification);
        };
      }
    } else if (!isAuthenticated && isConnectedRef.current) {
      socketService.disconnect();
      isConnectedRef.current = false;
    }
  }, [isAuthenticated, user, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnectedRef.current) {
        socketService.disconnect();
        isConnectedRef.current = false;
      }
    };
  }, []);

  return {
    isConnected: socketService.isConnected(),
    updateLocation: socketService.updateLocation.bind(socketService),
    updateOrderStatus: socketService.updateOrderStatus.bind(socketService),
    updateDriverAvailability: socketService.updateDriverAvailability.bind(socketService),
    joinRestaurant: socketService.joinRestaurant.bind(socketService),
    sendMessage: socketService.sendMessage.bind(socketService),
  };
};