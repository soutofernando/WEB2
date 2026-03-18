import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { getCategorias, getProducts } from "../lib/api";
import type { Categoria } from "../lib/api";
import type { Product } from "../components/ProductCard";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Categoria[] | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, token, isLoading } = useAuth();
  const navigate = useNavigate();

  const searchTerm = useMemo(() => {
    const s = search.trim();
    return s.length > 1 ? s : undefined;
  }, [search]);

  useEffect(() => {
    if (!token) return;
    setLoadingCategories(true);
    setError(null);
    getCategorias(token)
      .then(setCategories)
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erro ao carregar categorias");
        setCategories([]);
      })
      .finally(() => setLoadingCategories(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoadingProducts(true);
    setError(null);
    getProducts({
      token,
      search: searchTerm,
      categoriaId: selectedCategoryId ?? undefined,
      page: 1,
      limit: 100,
    })
      .then((ps) =>
        setProducts(
          ps.map((p) => ({
            _id: String(p.id),
            name: p.nome,
            price: typeof p.preco === "string" ? parseFloat(p.preco) : (p.preco as number),
            description: undefined,
            category: p.categoria?.nome ?? "Sem categoria",
            image: p.image ?? undefined,
            stock: p.estoque?.quantidade ?? 0,
          }))
        )
      )
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erro ao carregar produtos");
        setProducts([]);
      })
      .finally(() => setLoadingProducts(false));
  }, [token, searchTerm, selectedCategoryId]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !token) {
      navigate("/login");
    }
  }, [isLoading, user, token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Todos os produtos</h1>
        <p className="text-gray-500 mb-8">Navegue pelo catálogo</p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              key="all"
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategoryId === null
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              Todos
            </button>
            {(categories ?? []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategoryId === cat.id
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm mb-6">
            {error}
          </div>
        ) : null}

        {loadingCategories || loadingProducts || products === null ? (
          <LoadingSpinner size="lg" />
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
