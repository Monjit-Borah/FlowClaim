"use client";

import { create } from "zustand";

interface UIState {
  mobileNavOpen: boolean;
  toggleMobileNav: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false,
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen }))
}));
