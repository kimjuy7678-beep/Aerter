import { create } from 'zustand';
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithCustomToken,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    GoogleAuthProvider,
    type User as FirebaseUser,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../lib/firebase';
import { loginWithKakaoPopup, getKakaoCallbackUrl } from '../lib/kakao';
import { loginWithNaverPopup } from '../lib/naver';

export type SocialProvider = 'google' | 'kakao' | 'naver' | 'email';

export interface AppUser {
    id: string;
    name: string;
    email: string;
    photoURL: string | null;
    provider: SocialProvider;
}

interface AuthState {
    user: AppUser | null;
    isLoggedIn: boolean;
    initializing: boolean;
    loginWithGoogle: () => Promise<void>;
    loginWithKakao: () => Promise<void>;
    loginWithNaver: () => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
}

const PROVIDER_KEY = 'aerher_last_provider';

function toAppUser(firebaseUser: FirebaseUser, provider: SocialProvider): AppUser {
    return {
        id: firebaseUser.uid,
        name: firebaseUser.displayName ?? '회원',
        email: firebaseUser.email ?? '',
        photoURL: firebaseUser.photoURL,
        provider,
    };
}

export const useAuthStore = create<AuthState>((set) => {
    onAuthStateChanged(auth, (firebaseUser) => {
        if (!firebaseUser) {
            set({ user: null, isLoggedIn: false, initializing: false });
            return;
        }
        const lastProvider =
            (localStorage.getItem(PROVIDER_KEY) as SocialProvider | null) ?? 'google';
        set({
            user: toAppUser(firebaseUser, lastProvider),
            isLoggedIn: true,
            initializing: false,
        });
    });

    return {
        user: null,
        isLoggedIn: false,
        initializing: true,

        loginWithGoogle: async () => {
            localStorage.setItem(PROVIDER_KEY, 'google');
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        },

        loginWithKakao: async () => {
            const code = await loginWithKakaoPopup();

            const kakaoLogin = httpsCallable<
                { code: string; redirectUri: string },
                { token: string }
            >(functions, 'kakaoLogin');
            const { data } = await kakaoLogin({
                code,
                redirectUri: getKakaoCallbackUrl(),
            });

            localStorage.setItem(PROVIDER_KEY, 'kakao');
            await signInWithCustomToken(auth, data.token);
        },

        loginWithNaver: async () => {
            const naverAccessToken = await loginWithNaverPopup();

            const naverLogin = httpsCallable<{ accessToken: string }, { token: string }>(
                functions,
                'naverLogin'
            );
            const { data } = await naverLogin({ accessToken: naverAccessToken });

            localStorage.setItem(PROVIDER_KEY, 'naver');
            await signInWithCustomToken(auth, data.token);
        },

        loginWithEmail: async (email: string, password: string) => {
            localStorage.setItem(PROVIDER_KEY, 'email');
            await signInWithEmailAndPassword(auth, email, password);
        },

        signUpWithEmail: async (email: string, password: string, name: string) => {
            localStorage.setItem(PROVIDER_KEY, 'email');
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            if (name) {
                await updateProfile(credential.user, { displayName: name });
            }
            set({
                user: toAppUser(credential.user, 'email'),
                isLoggedIn: true,
                initializing: false,
            });
        },

        logout: async () => {
            await signOut(auth);
            localStorage.removeItem(PROVIDER_KEY);
            set({ user: null, isLoggedIn: false });
        },
    };
});