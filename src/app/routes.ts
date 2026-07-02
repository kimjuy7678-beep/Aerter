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

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'collection', Component: CollectionPage },
      { path: 'collection/:productId', Component: ProductDetailPage },
      { path: 'brand', Component: BrandPage },
      { path: 'cart', Component: CartPage },
      { path: 'login', Component: LoginPage },
      // Protected routes — guarded inside the page component itself
      { path: 'mypage', Component: MyPage },
      { path: 'checkout', Component: CheckoutPage },
    ],
  },
]);
