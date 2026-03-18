/**
 * Cliente da API do back (Lojinha UFCG).
 * Base: http://localhost:3000 — use VITE_API_URL no .env para alterar.
 */

// Em dev, usar "" para o proxy do Vite (/auth e /api → back). Senão usar env ou fallback.
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:3000");

/** Extrai mensagem de erro da resposta do back ou gera uma padrão */
function getErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string") {
    return (data as { message: string }).message;
  }
  if (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string") {
    return (data as { error: string }).error;
  }
  return fallback;
}

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface LoginResponse {
  message: string;
  token: string;
  user: BackendUser;
}

export interface RegisterResponse {
  message: string;
  user: BackendUser;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
}

export interface Estoque {
  id: number;
  quantidade: number;
  quantidadeMinima: number;
}

export interface ProductBackResponse {
  id: number;
  nome: string;
  preco: number | string;
  categoriaId: number;
  estoqueId: number;
  image?: string | null;
  categoria?: { id: number; nome: string };
  estoque?: { id: number; quantidade: number; quantidadeMinima?: number };
}

export interface ProductListResponse {
  data: ProductBackResponse[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

/** Headers com token para rotas em /api/* */
export function getAuthHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data, "Falha no login"));
  return data;
}

export async function register(name: string, email: string, password: string): Promise<RegisterResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data, "Falha no cadastro"));
  return data;
}

export interface Pedido {
  id: number;
  usuarioId: number;
  status: string;
  valorTotal: number | string;
  dataPedido?: string;
}

export async function getPedidosByUsuario(usuarioId: number, token: string): Promise<Pedido[]> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/pedidos/usuario/${usuarioId}`, {
      headers: getAuthHeaders(token),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data, "Erro ao carregar pedidos"));
  return Array.isArray(data.pedidos) ? data.pedidos : [];
}

// ── Produtos/Categorias (Back-end) ──────────────────────────────────────────────

export async function getCategorias(token: string): Promise<Categoria[]> {
  const res = await fetch(`${API_BASE}/api/categorias`, {
    headers: getAuthHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data, "Erro ao carregar categorias"));
  // O controller retorna { data, totalItems, ... }
  return Array.isArray(data.data) ? (data.data as Categoria[]) : [];
}

export async function getProducts(options: {
  token: string;
  search?: string;
  categoriaId?: number;
  page?: number;
  limit?: number;
}): Promise<ProductBackResponse[]> {
  const { token, search, categoriaId, page = 1, limit = 100 } = options;
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search && search.trim().length > 1) params.set("nome", search.trim());
  if (categoriaId != null) params.set("categoriaId", String(categoriaId));

  const res = await fetch(`${API_BASE}/api/products?${params.toString()}`, {
    headers: getAuthHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data, "Erro ao carregar produtos"));
  // O controller retorna { data, totalItems, ... }
  return Array.isArray(data.data) ? (data.data as ProductBackResponse[]) : [];
}

export async function getProductById(token: string, id: number): Promise<ProductBackResponse> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    headers: getAuthHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data, "Erro ao carregar produto"));
  return data.product as ProductBackResponse;
}

// ── Admin: Estoques e Produtos ─────────────────────────────────────────────────

export async function adminCreateEstoque(token: string, estoque: { quantidade: number; quantidadeMinima: number }): Promise<Estoque> {
  const res = await fetch(`${API_BASE}/api/estoques`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(estoque),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data, "Erro ao criar estoque"));
  return data.estoque as Estoque;
}

export async function adminUpdateEstoque(
  token: string,
  id: number,
  estoque: { quantidade?: number; quantidadeMinima?: number }
): Promise<Estoque> {
  const res = await fetch(`${API_BASE}/api/estoques/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(estoque),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data, "Erro ao atualizar estoque"));
  return data.estoque as Estoque;
}

export async function adminCreateProduct(
  token: string,
  product: { nome: string; preco: number; categoriaId: number; estoqueId: number; image?: string | null }
) {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(product),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data, "Erro ao criar produto"));
  return data.product ?? data;
}

export async function adminUpdateProduct(
  token: string,
  id: number,
  product: { nome?: string; preco?: number; categoriaId?: number; estoqueId?: number; image?: string | null }
) {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(product),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data, "Erro ao atualizar produto"));
  return data.product ?? data;
}

export async function adminDeleteProduct(token: string, id: number) {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data, "Erro ao excluir produto"));
  return data;
}

// ── Pedidos (Back-end) ───────────────────────────────────────────────────────

export async function createPedidoBack(
  token: string,
  produtos: Array<{ produtoId: number; quantidade: number }>,
  status?: string
) {
  const res = await fetch(`${API_BASE}/api/pedidos`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ produtos, status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data, "Erro ao criar pedido"));
  return data.pedido ?? data;
}
