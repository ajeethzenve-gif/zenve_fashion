import { create } from 'zustand';
import { Product } from '../types/product';
import { useCartStore } from './cartStore';
import { useAuthStore } from './authStore';
import { wishlistService } from '../services/wishlistService';
interface WishlistState {
 items: Product[]; loaded: boolean; error: string | null;
 addItem: (p: Product)=>Promise<boolean>; removeItem:(id:string)=>Promise<boolean>;
 toggleWishlist:(p:Product)=>Promise<boolean>; isInWishlist:(id:string)=>boolean;
 moveToCart:(p:Product)=>Promise<void>; clearWishlist:()=>Promise<boolean>;
}
let pending: Promise<unknown> = Promise.resolve();
export const useWishlistStore = create<WishlistState>((set,get)=> {
 const save=(change:(items:Product[])=>Product[]):Promise<boolean>=> {
  const owner=useAuthStore.getState().user?.id;
  const work=pending.then(async()=> {
   if (!owner || owner!==useAuthStore.getState().user?.id) {set({error:'Please log in to save your wishlist.'});return false;}
   if(!get().loaded){set({error:"Your wishlist is still loading. Please try again."});return false;}
   try {
    const items=await wishlistService.syncWishlist(change(get().items).map(p=>p.id));
    if(owner!==useAuthStore.getState().user?.id)return false;
    set({items,error:null});return true;
   } catch(err:any) {set({error:err.response?.data?.message || 'Could not save your wishlist. Please try again.'});return false;}
  }); pending=work;return work;
 };
 return {items:[],loaded:false,error:null,
  addItem:p=>save(items=>items.some(i=>i.id===p.id)?items:[...items,p]),
  removeItem:id=>save(items=>items.filter(p=>p.id!==id)),
  toggleWishlist:p=>save(items=>items.some(i=>i.id===p.id)?items.filter(i=>i.id!==p.id):[...items,p]),
  isInWishlist:id=>get().items.some(p=>p.id===id),
  clearWishlist:()=>save(()=>[]),
  moveToCart:async p=>{if(await useCartStore.getState().addItem(p,p.sizes[0] || 'Standard',p.colors[0] || {name:'Standard',hex:'#E4BD5A'}))await get().removeItem(p.id);},
 };
});
