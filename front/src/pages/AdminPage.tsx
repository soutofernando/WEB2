import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import {
  adminCreateEstoque,
  adminCreateProduct,
  adminDeleteProduct,
  adminUpdateEstoque,
  adminUpdateProduct,
  getCategorias,
  getProducts,
} from "../lib/api";
import type { Categoria, ProductBackResponse } from "../lib/api";

const EMPTY_FORM = {
  nome: "",
  preco: "",
  categoriaId: "",
  image: "",
  quantidade: "",
  quantidadeMinima: "0",
};

type AdminProductRow = {
  id: number;
  nome: string;
  preco: number;
  categoriaId: number;
  categoriaNome: string;
  image?: string | null;
  estoqueId: number;
  estoqueQuantidade: number;
  estoqueMinima: number;
};

function parseMoney(v: string) {
  const normalized = v.trim().replace(",", ".");
  return parseFloat(normalized);
}

function parseIntSafe(v: string) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 0 : n;
}

function formatPrice(value: number) {
  return value.toFixed(2).replace(".", ",");
}

export default function AdminPage() {
  const { user, isAdmin, isLoading, token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const canLoad = !isLoading && !!token && !!user && isAdmin;

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [cats, ps] = await Promise.all([
        getCategorias(token),
        getProducts({ token, page: 1, limit: 200 }),
      ]);

      setCategories(cats);
      setProducts(
        ps.map((p: ProductBackResponse) => ({
          id: p.id,
          nome: p.nome,
          preco: typeof p.preco === "string" ? parseMoney(p.preco) : (p.preco as number),
          categoriaId: p.categoriaId,
          categoriaNome: p.categoria?.nome ?? "Sem categoria",
          image: p.image ?? null,
          estoqueId: p.estoqueId,
          estoqueQuantidade: p.estoque?.quantidade ?? 0,
          estoqueMinima: (p.estoque as any)?.quantidadeMinima ?? 0,
        }))
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar admin.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canLoad) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) navigate("/login");
  }, [isLoading, user, navigate]);

  const stats = useMemo(() => {
    const total = products.length;
    const emEstoque = products.filter((p) => p.estoqueQuantidade > 0).length;
    const semEstoque = total - emEstoque;
    return { total, emEstoque, semEstoque };
  }, [products]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleEdit = (p: AdminProductRow) => {
    setEditingId(p.id);
    setForm({
      nome: p.nome,
      preco: String(p.preco),
      categoriaId: String(p.categoriaId),
      image: p.image ? String(p.image) : "",
      quantidade: String(p.estoqueQuantidade),
      quantidadeMinima: String(p.estoqueMinima ?? 0),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const nome = form.nome.trim();
    const preco = parseMoney(form.preco);
    const categoriaId = parseIntSafe(form.categoriaId);
    const quantidade = parseIntSafe(form.quantidade);
    const quantidadeMinima = parseIntSafe(form.quantidadeMinima);
    const image = form.image.trim() ? form.image.trim() : undefined;

    if (!nome || Number.isNaN(preco) || !categoriaId) {
      toast.error("Preencha Nome, Preço e Categoria válidos.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId == null) {
        // Back: Product precisa apontar para um Estoque existente.
        const estoque = await adminCreateEstoque(token, {
          quantidade,
          quantidadeMinima,
        });
        await adminCreateProduct(token, {
          nome,
          preco,
          categoriaId,
          estoqueId: estoque.id,
          image,
        });
        toast.success("Produto criado com sucesso!");
      } else {
        const current = products.find((p) => p.id === editingId);
        if (!current) throw new Error("Produto em edição não encontrado.");

        // Atualiza estoque já vinculado ao produto.
        await adminUpdateEstoque(token, current.estoqueId, {
          quantidade,
          quantidadeMinima,
        });

        // Atualiza dados do produto.
        await adminUpdateProduct(token, editingId, {
          nome,
          preco,
          categoriaId,
          image,
        });
        toast.success("Produto atualizado com sucesso!");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar produto.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("Excluir este produto?")) return;
    try {
      await adminDeleteProduct(token, id);
      toast.success("Produto excluído.");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao excluir.");
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Acesso negado. Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel administrativo</h1>
            <p className="text-gray-500 mt-1">Gerencie seus produtos</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-primary text-white font-bold px-5 py-2.5 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar produto
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm mb-6">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total de produtos", value: stats.total, icon: "📦" },
            { label: "Em estoque", value: stats.emEstoque, icon: "✅" },
            { label: "Sem estoque", value: stats.semEstoque, icon: "❌" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-container shadow p-5 flex items-center gap-4">
              <span className="text-3xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-container shadow-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? "Editar produto" : "Novo produto"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      value={form.nome}
                      onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                      required
                      placeholder="Nome do produto"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                    <input
                      type="number"
                      value={form.preco}
                      onChange={(e) => setForm((p) => ({ ...p, preco: e.target.value }))}
                      required
                      placeholder="0,00"
                      step="0.01"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      value={form.categoriaId}
                      onChange={(e) => setForm((p) => ({ ...p, categoriaId: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade (estoque)</label>
                    <input
                      type="number"
                      value={form.quantidade}
                      onChange={(e) => setForm((p) => ({ ...p, quantidade: e.target.value }))}
                      required
                      placeholder="0"
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade mínima</label>
                    <input
                      type="number"
                      value={form.quantidadeMinima}
                      onChange={(e) => setForm((p) => ({ ...p, quantidadeMinima: e.target.value }))}
                      required
                      placeholder="0"
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da imagem</label>
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                      className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-container shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Produtos ({products.length})</h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="font-medium">Nenhum produto ainda</p>
              <p className="text-sm mt-1">Adicione seu primeiro produto para começar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left">Produto</th>
                    <th className="px-6 py-3 text-left">Categoria</th>
                    <th className="px-6 py-3 text-left">Preço</th>
                    <th className="px-6 py-3 text-left">Estoque</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {p.image ? (
                              <img src={p.image} alt={p.nome} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                IMG
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{p.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.categoriaNome}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">R$ {formatPrice(p.preco)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            p.estoqueQuantidade > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {p.estoqueQuantidade > 0 ? `${p.estoqueQuantidade} em estoque` : "Sem estoque"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="text-sm text-primary hover:text-primary-hover font-medium px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
