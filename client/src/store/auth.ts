import { create } from 'zustand';
import { api, type AuthResponse } from '../lib/api';

interface AuthState {
  user: AuthResponse['user'] | null;
  balanceTon: string;
  lockedTon: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setBalances: (bal: { balanceTon: string; lockedTon: string }) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  balanceTon: '0',
  lockedTon: '0',
  loading: false,
  error: null,
  async refresh() {
    set({ loading: true, error: null });
    try {
      const res = await api.auth();
      set({ user: res.user, balanceTon: res.balanceTon, lockedTon: res.lockedTon, loading: false });
    } catch (err) {
      set({ loading: false, error: String(err) });
    }
  },
  setBalances({ balanceTon, lockedTon }) {
    set({ balanceTon, lockedTon });
  },
}));
