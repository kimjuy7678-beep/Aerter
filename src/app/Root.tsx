import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { OrderProvider } from '../context/OrderContext';
import { AddressProvider } from '../context/AddressContext';
import ScrollToTop from '../components/ScrollToTop';

export default function Root() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <AuthProvider>
      <AddressProvider>
        <OrderProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="bg-white overflow-x-hidden min-h-screen flex flex-col">
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-foreground focus:text-sm"
                >
                  메인 콘텐츠로 이동
                </a>
                <Header />
                <main id="main-content" className="flex-1">
                  <Outlet />
                  <ScrollToTop />
                </main>
                <Footer />
              </div>
            </CartProvider>
          </WishlistProvider>
        </OrderProvider>
      </AddressProvider>
    </AuthProvider>
  );
}
