import { create } from 'zustand';

interface UIState {
  isCartDrawerOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchOverlayOpen: boolean;
  searchQuery: string;

  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;

  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  openSearchOverlay: () => void;
  closeSearchOverlay: () => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartDrawerOpen: false,
  isMobileMenuOpen: false,
  isSearchOverlayOpen: false,
  searchQuery: '',

  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  openSearchOverlay: () => set({ isSearchOverlayOpen: true }),
  closeSearchOverlay: () => set({ isSearchOverlayOpen: false, searchQuery: '' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
