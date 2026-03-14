import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

const EMPTY_FORM = { name: "", price: "", description: "", category: "", image: "", stock: "" };

export default function AdminPage() {
  const user = useQuery(api.auth.loggedInUser);
  const navigate = useNavigate();
  const products = useQuery(api.products.list, {});
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  if (user === undefined || products === undefined) {
    return <div className="min-h-screen bg-gray-50"><LoadingSpinner size="lg" /></div>;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      description: form.description,
      category: form.category,
      image: form.image || undefined,
      stock: form.stock ? parseInt(form.stock) : 0,
    };
    try {
      if (editingId) {
        await updateProduct({ id: editingId, ...payload });
        toast.success("Produto atualizado!");
      } else {
        await createProduct(payload);
        toast.success("Product created!");
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || "Operação falhou.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p: typeof products[0]) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: String(p.price),
      description: p.description,
      category: p.category,
      image: p.image || "",
      stock: String(p.stock),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: Id<"products">) => {
    if (!confirm("Excluir este produto?")) return;
    try {
      await deleteProduct({ id });
      toast.success("Produto excluído.");
    } catch (err: any) {
      toast.error(err.message || "Falha ao excluir.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel administrativo</h1>
            <p className="text-gray-500 mt-1">Gerencie seus produtos e pedidos</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
            className="bg-primary text-white font-bold px-5 py-2.5 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar produto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total de produtos", value: products.length, icon: "📦" },
            { label: "Em estoque", value: products.filter((p) => p.stock > 0).length, icon: "✅" },
            { label: "Sem estoque", value: products.filter((p) => p.stock === 0).length, icon: "❌" },
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

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-container shadow-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? "Editar produto" : "Novo produto"}
                  </h2>
                  <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { label: "Nome", key: "name", type: "text", required: true, placeholder: "Nome do produto" },
                    { label: "Preço", key: "price", type: "number", required: true, placeholder: "0,00" },
                    { label: "Categoria", key: "category", type: "text", required: true, placeholder: "Eletrônicos" },
                    { label: "URL da imagem", key: "image", type: "url", required: false, placeholder: "https://..." },
                    { label: "Estoque", key: "stock", type: "number", required: true, placeholder: "0" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        value={(form as any)[field.key]}
                        onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      required
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                      placeholder="Descrição do produto..."
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingId(null); }}
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

        {/* Products Table */}
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
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.category}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">R$ {p.price?.toFixed(2).replace(".", ",")}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {p.stock > 0 ? `${p.stock} em estoque` : "Sem estoque"}
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
                            onClick={() => handleDelete(p._id)}
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
