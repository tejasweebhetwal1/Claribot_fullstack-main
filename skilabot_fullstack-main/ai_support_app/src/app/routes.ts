import {
  createBrowserRouter,
} from "react-router";

import Root from "./layouts/Root";

import LandingPage from "./pages/LandingPage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";

import LoginPage from "./pages/LoginPage";
import CustomerAccountPage from "./pages/CustomerAccountPage";

import DemoChatPage from "./pages/DemoChatPage";
import ChatPage from "./pages/ChatPage";
import BusinessPage from "./pages/BusinessPage";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrdersPage from "./pages/AdminOrdersPage";

export const router =
  createBrowserRouter([
    {
      path: "/",
      Component: Root,
      children: [
        {
          index: true,
          Component: LandingPage,
        },
        {
          path: "shop",
          Component: ShopPage,
        },
        {
          path: "product/:id",
          Component: ProductPage,
        },
        {
          path: "cart",
          Component: CartPage,
        },
        {
          path: "checkout",
          Component: CheckoutPage,
        },
        {
          path: "order-success/:id",
          Component:
            OrderSuccessPage,
        },
        {
          path: "contact",
          Component: ContactPage,
        },
        {
          path: "faq",
          Component: FaqPage,
        },
        {
          path: "login",
          Component: LoginPage,
        },
        {
          path: "account",
          Component:
            CustomerAccountPage,
        },
        {
          path: "demo-chat",
          Component: DemoChatPage,
        },
        {
          path: "chat",
          Component: ChatPage,
        },
        {
          path: "business",
          Component: BusinessPage,
        },
        {
          path: "admin-login",
          Component: AdminLogin,
        },
        {
          path: "admin",
          Component: AdminDashboard,
        },
        {
          path: "admin-dashboard",
          Component: AdminDashboard,
        },
        {
          path: "admin-orders",
          Component:
            AdminOrdersPage,
        },
      ],
    },
  ]);