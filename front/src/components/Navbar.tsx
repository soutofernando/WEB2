import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Lojinha UFCG" className="h-10 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-900 hover:text-primary transition-colors text-sm font-medium">
              Início
            </Link>
            <Link to="/#sobre" className="text-gray-900 hover:text-primary transition-colors text-sm font-medium">
              Sobre nós
            </Link>
            <Link to="/register" className="text-gray-900 hover:text-primary transition-colors text-sm font-medium">
              Registrar
            </Link>
            <Link
              to="/cart"
              className="relative p-2 text-gray-900 hover:text-primary transition-colors"
              aria-label="Carrinho"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-900 hover:text-primary transition-colors text-sm font-medium"
                >
                  Meu perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
