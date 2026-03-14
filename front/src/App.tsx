import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <SeedOnMount />
        <Navbar />
        <div className="flex flex-col min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
          <Footer />
        </div>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </CartProvider>
  );
}

function SeedOnMount() {
  const seed = useMutation(api.products.seed);
  useEffect(() => {
    seed({}).catch(() => {});
  }, []);
  return null;
}
