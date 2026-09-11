import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy loaded page components for optimal production performance
const Home = lazy(() => import('../pages/Home/Home').then((m) => ({ default: m.Home })));
const Shop = lazy(() => import('../pages/Shop/Shop').then((m) => ({ default: m.Shop })));
const CollectionsPage = lazy(() => import('../pages/Collection/CollectionsPage').then((m) => ({ default: m.CollectionsPage })));
const PeoplePage = lazy(() => import('../pages/Collection/PeoplePage').then((m) => ({ default: m.PeoplePage })));
const PetsPage = lazy(() => import('../pages/Collection/PetsPage').then((m) => ({ default: m.PetsPage })));
const TwinPage = lazy(() => import('../pages/Collection/TwinPage').then((m) => ({ default: m.TwinPage })));
const ProductDetail = lazy(() => import('../pages/Product/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const Cart = lazy(() => import('../pages/Cart/Cart').then((m) => ({ default: m.Cart })));
const Checkout = lazy(() => import('../pages/Checkout/Checkout').then((m) => ({ default: m.Checkout || m.default })));
const OrderSuccess = lazy(() => import('../pages/Checkout/OrderSuccess').then((m) => ({ default: m.OrderSuccess })));
const Wishlist = lazy(() => import('../pages/Wishlist/Wishlist').then((m) => ({ default: m.Wishlist })));
const SearchPage = lazy(() => import('../pages/Search/SearchPage').then((m) => ({ default: m.SearchPage })));
const Login = lazy(() => import('../pages/Account/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('../pages/Account/Register').then((m) => ({ default: m.Register })));
const Account = lazy(() => import('../pages/Account/Account').then((m) => ({ default: m.Account })));
const OrderDetail = lazy(() => import('../pages/Account/OrderDetail').then((m) => ({ default: m.OrderDetail })));
const ShowroomPage = lazy(() => import('../pages/Showroom/ShowroomPage').then((m) => ({ default: m.ShowroomPage })));
const JournalList = lazy(() => import('../pages/Journal/JournalList').then((m) => ({ default: m.JournalList })));
const JournalDetail = lazy(() => import('../pages/Journal/JournalDetail').then((m) => ({ default: m.JournalDetail })));
const About = lazy(() => import('../pages/About/About').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('../pages/Contact/Contact').then((m) => ({ default: m.Contact })));
const PolicyPage = lazy(() => import('../pages/Policy/PolicyPage').then((m) => ({ default: m.PolicyPage })));
const NotFound = lazy(() => import('../pages/NotFound/NotFound').then((m) => ({ default: m.NotFound })));

// Loading Fallback
const PageLoader: React.FC = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#002B1D] space-y-4">
    <div className="w-10 h-10 border-2 border-[#E4BD5A] border-t-transparent rounded-full animate-spin" />
    <span className="font-serif text-xs tracking-[0.25em] text-[#E4BD5A] uppercase">
      ZENVE ATELIER
    </span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Main Core Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/twin" element={<TwinPage />} />
          <Route path="/product/:slug" element={<ProductDetail />} />

          {/* Commerce & Checkout */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/search" element={<SearchPage />} />

          {/* Auth & Customer Account */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<Login defaultForgotPassword={true} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/orders"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />

          {/* Showroom & Contact */}
          <Route path="/showroom" element={<ShowroomPage />} />
          <Route path="/showroom/appointment" element={<Navigate to="/contact" replace />} />
          <Route path="/appointment" element={<Navigate to="/contact" replace />} />

          {/* Journal */}
          <Route path="/journal" element={<JournalList />} />
          <Route path="/journal/:slug" element={<JournalDetail />} />

          {/* Brand & Client Services */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Legal & Policy Pages */}
          <Route path="/privacy" element={<PolicyPage />} />
          <Route path="/terms" element={<PolicyPage />} />
          <Route path="/shipping" element={<PolicyPage />} />
          <Route path="/refund" element={<PolicyPage />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};
