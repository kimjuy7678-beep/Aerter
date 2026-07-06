import { create } from 'zustand';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/Firebase';

const SESSION_KEY = 'aerher_admin_session';

interface AdminAuthState {
    isAdminLoggedIn: boolean;
    loading: boolean;
    error: string | null;
    loginAdmin: (password: string) => Promise<void>;
    logoutAdmin: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
    isAdminLoggedIn: typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === 'true',
    loading: false,
    error: null,

    loginAdmin: async (password: string) => {
        set({ loading: true, error: null });
        try {
            const adminLogin = httpsCallable<{ password: string }, { ok: boolean }>(functions, 'adminLogin');
            await adminLogin({ password });
            sessionStorage.setItem(SESSION_KEY, 'true');
            set({ isAdminLoggedIn: true, loading: false });
        } catch (err) {
            set({ error: '비밀번호가 올바르지 않습니다.', loading: false });
            throw err;
        }
    },

    logoutAdmin: () => {
        sessionStorage.removeItem(SESSION_KEY);
        set({ isAdminLoggedIn: false });
    },
}));