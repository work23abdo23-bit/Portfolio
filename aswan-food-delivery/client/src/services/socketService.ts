import { io, Socket } from 'socket.io-client';
import { OrderUpdate } from '@/types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    const serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      auth: {
        token,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Connected to real-time service');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from real-time service:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🔌 Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('connected', (data) => {
      console.log('🔌 Welcome message:', data.message);
    });

    this.socket.on('error', (error) => {
      console.error('🔌 Socket error:', error);
    });
  }

  // Order tracking
  onOrderUpdate(callback: (update: OrderUpdate) => void): void {
    this.socket?.on('order_update', callback);
  }

  offOrderUpdate(callback?: (update: OrderUpdate) => void): void {
    if (callback) {
      this.socket?.off('order_update', callback);
    } else {
      this.socket?.off('order_update');
    }
  }

  // Driver location tracking
  onDriverLocation(callback: (data: {
    orderId: string;
    orderNumber: string;
    driverLocation: { latitude: number; longitude: number };
    timestamp: string;
  }) => void): void {
    this.socket?.on('driver_location', callback);
  }

  offDriverLocation(callback?: Function): void {
    if (callback) {
      this.socket?.off('driver_location', callback);
    } else {
      this.socket?.off('driver_location');
    }
  }

  // Send location updates (for drivers)
  updateLocation(data: { 
    latitude: number; 
    longitude: number; 
    orderId?: string 
  }): void {
    this.socket?.emit('location_update', data);
  }

  // Update order status (for restaurant owners and drivers)
  updateOrderStatus(data: {
    orderId: string;
    status: string;
    message?: string;
  }): void {
    this.socket?.emit('order_status_update', data);
  }

  // Driver availability (for drivers)
  updateDriverAvailability(isAvailable: boolean): void {
    this.socket?.emit('driver_availability', { isAvailable });
  }

  // Join restaurant room (for restaurant owners)
  joinRestaurant(restaurantId: string): void {
    this.socket?.emit('join_restaurant', { restaurantId });
  }

  // Send message in order chat
  sendMessage(data: {
    orderId: string;
    message: string;
    recipientRole: 'customer' | 'restaurant' | 'driver';
  }): void {
    this.socket?.emit('send_message', data);
  }

  // Listen for new messages
  onNewMessage(callback: (data: {
    orderId: string;
    senderId: string;
    senderRole: string;
    message: string;
    timestamp: string;
  }) => void): void {
    this.socket?.on('new_message', callback);
  }

  offNewMessage(callback?: Function): void {
    if (callback) {
      this.socket?.off('new_message', callback);
    } else {
      this.socket?.off('new_message');
    }
  }

  // Listen for new orders (for restaurant owners)
  onNewOrder(callback: (data: {
    orderId: string;
    orderNumber: string;
    customer: any;
    total: number;
    items: any[];
    message: string;
    messageAr: string;
  }) => void): void {
    this.socket?.on('new_order', callback);
  }

  offNewOrder(callback?: Function): void {
    if (callback) {
      this.socket?.off('new_order', callback);
    } else {
      this.socket?.off('new_order');
    }
  }

  // Notifications
  onNotification(callback: (notification: {
    id: string;
    title: string;
    titleAr?: string;
    message: string;
    messageAr?: string;
    type: string;
    data?: any;
  }) => void): void {
    this.socket?.on('notification', callback);
  }

  offNotification(callback?: Function): void {
    if (callback) {
      this.socket?.off('notification', callback);
    } else {
      this.socket?.off('notification');
    }
  }

  // Broadcast messages (for admin notifications)
  onBroadcast(callback: (data: any) => void): void {
    this.socket?.on('broadcast', callback);
  }

  offBroadcast(callback?: Function): void {
    if (callback) {
      this.socket?.off('broadcast', callback);
    } else {
      this.socket?.off('broadcast');
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;