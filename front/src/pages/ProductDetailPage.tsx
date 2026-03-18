import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { getProductById, getProducts } from "../lib/api";
import type { Product } from "../components/ProductCard";

function formatPrice(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { user, token, isLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);

  const [error, setError] = useState<string | null>(null);

  const canLoad = useMemo(() => !isLoading && !!token && !!id, [isLoading, token, id]);

  useEffect(() => {
    if (!canLoad) return;
    setError(null);

    const productId = parseInt(id!, 10);
    if (Number.isNaN(productId)) {
      setError("ID inválido.");
      setProduct(null);
      setRelatedProducts([]);
      return;
    }

    getProductById(token!, productId)
      .then((p) => {
        const mapped: Product = {
          _id: String(p.id),
          name: p.nome,
          price: typeof p.preco === "string" ? parseFloat(p.preco) : (p.preco as number),
          description: undefined,
          category: p.categoria?.nome ?? "Sem categoria",
          image: p.image ?? undefined,
          stock: p.estoque?.quantidade ?? 0,
        };
        setProduct(mapped);

        if (p.categoriaId != null) {
          return getProducts({ token: token!, categoriaId: p.categoriaId, page: 1, limit: 6 }).then((ps) => {
            const mappedRelated: Product[] = ps
              .filter((x) => x.id !== p.id)
              .map((x) => ({
                _id: String(x.id),
                name: x.nome,
                price: typeof x.preco === "string" ? parseFloat(x.preco) : (x.preco as number),
                description: undefined,
                category: x.categoria?.nome ?? "Sem categoria",
                    image: x.image ?? undefined,
                stock: x.estoque?.quantidade ?? 0,
              }));
            setRelatedProducts(mappedRelated);
          });
        }

        setRelatedProducts([]);
        return null;
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Erro ao carregar produto.");
        setError(e instanceof Error ? e.message : "Erro ao carregar produto.");
        setProduct(null);
        setRelatedProducts([]);
      });
  }, [canLoad, id, token]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || !token) {
    navigate("/login");
    return null;
  }

  if (error || product === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-500">
        {error ? error : "Produto não encontrado."}
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
              {product.description || "Descrição não disponível para este produto."}
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
                    {p.description || "Descrição não disponível."}
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
