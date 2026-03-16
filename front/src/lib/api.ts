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
