import { createBrowserRouter } from 'react-router';
import Root from './Root';
import HomePage from '../pages/HomePage';
import CollectionPage from '../pages/CollectionPage';
import BrandPage from '../pages/BrandPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import MyPage from '../pages/MyPage';
import CheckoutPage from '../pages/CheckoutPage';
import LoginPage from '../pages/LoginPage';
import NaverCallbackPage from '../pages/NaverCallbackpage';
import KakaoCallbackPage from '../pages/KakaoCallbackpage';
import NotFoundPage from '../pages/NotFoundPage';
import QuizPage from '../pages/QuizPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'collection', Component: CollectionPage },
      { path: 'collection/:productId', Component: ProductDetailPage },
      { path: 'brand', Component: BrandPage },
      { path: 'quiz', Component: QuizPage },
      { path: 'cart', Component: CartPage },
      { path: 'login', Component: LoginPage },
      // OAuth popups redirect here with the token/code in the URL
      { path: 'oauth/naver/callback', Component: NaverCallbackPage },
      { path: 'oauth/kakao/callback', Component: KakaoCallbackPage },
      // Protected routes — guarded inside the page component itself
      { path: 'mypage', Component: MyPage },
      { path: 'checkout', Component: CheckoutPage },
      // Admin — AdminDashboardPage's default export is already wrapped in
      // AdminProtectedRoute internally, so no JSX is needed here.
      { path: 'admin/login', Component: AdminLoginPage },
      { path: 'admin', Component: AdminDashboardPage },
      // Catch-all — must stay last
      { path: '*', Component: NotFoundPage },
    ],
  },
]);