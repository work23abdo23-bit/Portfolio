import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import { useAppSelector } from '@/store';
import { selectCartSidebarOpen } from '@/store/slices/uiSlice';

const Layout: React.FC = () => {
  const cartSidebarOpen = useAppSelector(selectCartSidebarOpen);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
      
      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartSidebarOpen} />
      
      {/* Overlay for mobile sidebar */}
      {cartSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => {
            // Close sidebar when clicking overlay
          }}
        />
      )}
    </div>
  );
};

export default Layout;