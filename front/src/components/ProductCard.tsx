import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export interface Product {
  _id: Id<"products">;
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string;
  stock: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image || "",
      quantity: 1,
    });
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="bg-white rounded-container shadow hover:shadow-card transition-shadow overflow-hidden border border-gray-100">
        <div className="aspect-square bg-gray-50 overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <span className="text-xs text-primary font-medium uppercase tracking-wide">
            {product.category}
          </span>
          <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-primary">
              R$ {product.price?.toFixed(2).replace(".", ",")}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-primary text-white text-sm px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? "Sem estoque" : "Adicionar ao carrinho"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
