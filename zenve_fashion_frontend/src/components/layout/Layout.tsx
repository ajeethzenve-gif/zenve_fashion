import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnnouncementBar } from './AnnouncementBar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { MobileMenu } from './MobileMenu';
import { SearchOverlay } from './SearchOverlay';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, search]);

  const isHome = pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#002B1D] text-[#F5F0DF] relative">
      <AnnouncementBar />
      <Navbar />
      <main className={`flex-1 w-full ${isHome ? '-mt-[73px] sm:-mt-[81px]' : ''}`}>{children}</main>
      <Footer />

      {/* Global Slide-outs and Modals */}
      <CartDrawer />
      <MobileMenu />
      <SearchOverlay />
    </div>
  );
};

export default Layout;
