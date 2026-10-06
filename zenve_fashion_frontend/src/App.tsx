import React from 'react';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';
import { useWishlistStore } from './store/wishlistStore';
import { cartService } from './services/cartService';
import { wishlistService } from './services/wishlistService';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export function App() {
  const userId = useAuthStore(s=>s.user?.id);
  const cartError = useCartStore(s=>s.error);
  const wishlistError = useWishlistStore(s=>s.error);
  React.useEffect(()=> {
    let cancelled=false;
    useCartStore.setState({items:[], loaded:false, error:null});
    useWishlistStore.setState({items:[], loaded:false, error:null});
    localStorage.removeItem('zenve-cart-storage');
    localStorage.removeItem('zenve-wishlist-storage');
    if(userId) {
      cartService.getCart().then(items=>{if(!cancelled)useCartStore.setState({items, loaded:true});})
        .catch(()=>{if(!cancelled)useCartStore.setState({error:'Could not load your saved cart.'});});
      wishlistService.getWishlist().then(items=>{if(!cancelled)useWishlistStore.setState({items, loaded:true});})
        .catch(()=>{if(!cancelled)useWishlistStore.setState({error:'Could not load your saved wishlist.'});});
    }
    return ()=>{cancelled=true;};
  },[userId]);
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {(cartError || wishlistError) && <div role="alert" className="fixed top-0 left-0 right-0 z-[100] bg-red-950 text-white p-4 text-center">
          {cartError || wishlistError} {!userId && <a href="/login" className="underline ml-3">Log in</a>}
          <button className="ml-4" onClick={()=>{useCartStore.setState({error:null});useWishlistStore.setState({error:null});}}>Dismiss</button>
        </div>}
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
