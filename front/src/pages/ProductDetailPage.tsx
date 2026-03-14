import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCart } from "../context/CartContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { Link } from "react-router-dom";

function formatPrice(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const product = useQuery(
    api.products.get,
    id ? { id: id as Id<"products"> } : "skip"
  );
  const allProducts = useQuery(api.products.list, {});
  const [quantity, setQuantity] = useState(1);

  const relatedProducts =
    allProducts?.filter((p) => p._id !== product?._id).slice(0, 6) ?? [];

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image || "",
      quantity,
    });
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (product === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-500">
        Produto não encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Área principal: imagem + informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          {/* Coluna esquerda: imagem do produto */}
          <div className="bg-white flex items-center justify-center min-h-80 md:min-h-96 p-6 border border-gray-100">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="max-h-96 w-full object-contain"
              />
            ) : (
              <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <svg
                  className="w-24 h-24 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Coluna direita: informações */}
          <div className="flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-bold text-black mb-1">
              {product.name}
            </h1>
            <p className="text-sm text-gray-400 mb-4">
              {product.category.toLowerCase()}
            </p>
            <p className="text-xl font-bold text-black mb-6">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm text-gray-400 mb-6 line-clamp-2">
              {product.description}
            </p>

            <div className="mb-6">
              <label htmlFor="quantity" className="sr-only">
                Quantidade
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                max={product.stock || 99}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="w-20 h-11 px-3 border-2 border-black rounded text-black font-medium focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-black text-white font-semibold py-3.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Colocar no carrinho
            </button>
          </div>
        </div>

        {/* Produtos relacionados */}
        <section className="mt-16 pt-10 border-t border-gray-100">
          <h2 className="text-xl font-bold text-black mb-8">
            Produtos relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="group block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-white flex items-center justify-center p-4">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="max-h-full w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
                      <svg
                        className="w-12 h-12 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-black group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {p.description}
                  </p>
                  <p className="text-black font-semibold mt-2">
                    {formatPrice(p.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
