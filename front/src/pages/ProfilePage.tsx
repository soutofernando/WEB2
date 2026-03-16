import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { getPedidosByUsuario, type Pedido } from "../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";

export type OrderDisplay = {
  id: string;
  date: string;
  total: number;
  status: string;
  source: "back" | "convex";
  items?: { name: string; quantity: number; price: number }[];
};

export default function ProfilePage() {
  const { user, token, isLoading, logout } = useAuth();
  const [backPedidos, setBackPedidos] = useState<Pedido[]>([]);
  const [backLoading, setBackLoading] = useState(true);
  const navigate = useNavigate();

  const convexOrders = useQuery(
    api.orders.myOrders,
    user ? { backendUserId: user.id } : "skip"
  );

  useEffect(() => {
    if (!user || !token) return;
    getPedidosByUsuario(user.id, token)
      .then(setBackPedidos)
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Erro ao carregar pedidos do servidor.");
        setBackPedidos([]);
      })
      .finally(() => setBackLoading(false));
  }, [user?.id, token]);

  const allOrders = useMemo((): OrderDisplay[] => {
    const fromBack: OrderDisplay[] = backPedidos.map((p) => ({
      id: `back-${p.id}`,
      date: p.dataPedido || new Date().toISOString(),
      total: Number(p.valorTotal),
      status: p.status || "pendente",
      source: "back",
    }));
    const fromConvex: OrderDisplay[] = (convexOrders ?? []).map((o) => ({
      id: `convex-${o._id}`,
      date: typeof o._creationTime === "number" ? new Date(o._creationTime).toISOString() : new Date().toISOString(),
      total: o.total ?? 0,
      status: o.status ?? "pending",
      source: "convex",
      items: o.items?.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
    }));
    return [...fromBack, ...fromConvex].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [backPedidos, convexOrders]);

  const pedidosLoading = backLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const statusColor: Record<string, string> = {
    pendente: "bg-yellow-100 text-yellow-700",
    pending: "bg-yellow-100 text-yellow-700",
    processando: "bg-blue-100 text-blue-700",
    enviado: "bg-purple-100 text-purple-700",
    entregue: "bg-green-100 text-green-700",
    cancelado: "bg-red-100 text-red-700",
  };

  const formatTotal = (v: number | string) =>
    Number(v).toFixed(2).replace(".", ",");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-container shadow-card p-6 mb-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-extrabold text-3xl">
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.name || "Usuário"}</h1>
            <p className="text-gray-500 mt-1">{user.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="text-sm text-red-500 hover:text-red-700 transition-colors border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50"
          >
            Sair
          </button>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Histórico de pedidos</h2>
          {pedidosLoading && convexOrders === undefined ? (
            <LoadingSpinner />
          ) : allOrders.length === 0 ? (
            <div className="bg-white rounded-container shadow p-10 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-medium">Nenhum pedido ainda</p>
              <p className="text-sm mt-1">Comece a comprar para ver seus pedidos aqui.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allOrders.map((order) => {
                const status = (order.status || "pendente").toLowerCase();
                const shortId = order.id.replace(/^(back-|convex-)/, "");
                return (
                  <div key={order.id} className="bg-white rounded-container shadow p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Pedido #{order.source === "back" ? shortId : shortId.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">
                          R$ {formatTotal(order.total)}
                        </span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor[status] || "bg-gray-100 text-gray-600"}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="border-t border-gray-50 pt-3 mt-3 space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm text-gray-600">
                            <span>{item.name} × {item.quantity}</span>
                            <span>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
