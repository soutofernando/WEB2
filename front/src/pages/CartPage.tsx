import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-700">Seu carrinho está vazio</h2>
        <p className="text-gray-500">Adicione produtos para começar!</p>
        <Link
          to="/products"
          className="bg-primary text-white font-bold px-8 py-3 rounded-lg hover:bg-primary-hover transition-colors"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrinho de compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="bg-white rounded-container shadow p-4 flex gap-4 items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-primary font-bold mt-1">R$ {item.price.toFixed(2).replace(".", ",")}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors text-gray-600 text-sm"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 font-semibold text-gray-900 border-x border-gray-200 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors text-gray-600 text-sm"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-gray-700 font-semibold w-20 text-right">
                    R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                  </span>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 transition-colors mt-2"
            >
              Esvaziar carrinho
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-container shadow p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Resumo do pedido</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                    <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total</span>
                  <span className="text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors"
              >
                Finalizar compra
              </button>
              <Link
                to="/products"
                className="block text-center text-sm text-gray-500 hover:text-primary transition-colors mt-3"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
