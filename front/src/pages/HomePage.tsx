import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import HomeProductCard from "../components/HomeProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import type { Product } from "../components/ProductCard";

const FEEDBACKS = [
  { text: "Camisa muito linda!", name: "Nome", role: "Cliente da Computação", color: "bg-blue-500" },
  { text: "Gostei muito do Casaco!", name: "Nome", role: "Engenheira Química", color: "bg-primary" },
  { text: "Muito bom!!", name: "Nome", role: "Engenheiro Civil", color: "bg-blue-600" },
];

function formatPrice(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export default function HomePage() {
  const products = useQuery(api.products.list, {});
  const { addItem } = useCart();

  const featured = products?.slice(0, 3) ?? [];
  const carouselProducts = products?.slice(0, 6) ?? [];
  const highlightProduct = products?.[0];

  const handleAddHighlight = (p: Product) => {
    addItem({
      productId: p._id,
      name: p.name,
      price: p.price,
      image: p.image || "",
      quantity: 1,
    });
    toast.success(`${p.name} adicionado ao carrinho!`);
  };

  return (
    <div className=" max-h-[572px]">
      {/* Hero - imagem clicável para /products */}
      <section className="mx-4 mt-4 lg:mx-16 lg:mt-6 rounded-2xl overflow-hidden">
        <Link to="/products" className="block w-full cursor-pointer hover:opacity-95 transition-opacity">
          <img
            src="/hero.png"
            alt="Orgulho de ser UFCG - Produtos oficiais e exclusivos. Ver coleção."
            className="w-full h-auto object-cover object-center rounded-2xl"
          />
        </Link>
      </section>

      {/* Featured Products - Grid de 3 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {products === undefined ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <HomeProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Produto destaque - faixa azul escura */}
      {highlightProduct && (
        <section className="bg-[#1e3a5f] text-white py-14 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 text-center lg:text-left">
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wide">
                Produto destaque
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2">
                {highlightProduct.name.split(" ").slice(0, 2).join(" ")}
              </h2>
              <p className="text-2xl lg:text-3xl font-bold mt-1">
                {highlightProduct.name.split(" ").slice(2).join(" ") || "Clássica"}
              </p>
              <p className="text-blue-300 text-lg mt-1">
                {highlightProduct.category || "Azul Marinho"}
              </p>
              <div className="flex flex-wrap gap-3 mt-6 justify-center lg:justify-start">
                <span className="bg-gray-900 text-white font-semibold px-5 py-2.5 rounded-lg">
                  {formatPrice(highlightProduct.price)}
                </span>
                <button
                  onClick={() => handleAddHighlight(highlightProduct)}
                  disabled={highlightProduct.stock === 0}
                  className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-64 h-64 lg:w-80 lg:h-80 bg-white/10 rounded-2xl overflow-hidden flex items-center justify-center">
                {highlightProduct.image ? (
                  <img
                    src={highlightProduct.image}
                    alt={highlightProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-white/50">UFCG</span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Carrossel de produtos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Carrosel de produtos
        </h2>
        {products === undefined ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
            {carouselProducts.map((p) => (
              <div key={p._id} className="flex-shrink-0 w-56">
                <HomeProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feedbacks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" id="sobre">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Feedbacks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEEDBACKS.map((fb, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <p className="text-gray-700 mb-4">&ldquo;{fb.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${fb.color} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {fb.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{fb.name}</p>
                  <p className="text-sm text-gray-500">{fb.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
