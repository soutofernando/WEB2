"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

const API_BASE = "http://localhost:3000";

async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const register = action({
  args: { name: v.string(), email: v.string(), password: v.string() },
  handler: async (_ctx, args) => {
    return await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(args),
    });
  },
});

export const login = action({
  args: { email: v.string(), password: v.string() },
  handler: async (_ctx, args) => {
    return await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(args),
    });
  },
});

// ── Products ──────────────────────────────────────────────────────────────────

export const getProducts = action({
  args: { token: v.optional(v.string()) },
  handler: async (_ctx, args) => {
    return await apiFetch("/api/products", {}, args.token);
  },
});

export const getProduct = action({
  args: { id: v.string(), token: v.optional(v.string()) },
  handler: async (_ctx, args) => {
    return await apiFetch(`/api/products/${args.id}`, {}, args.token);
  },
});

// ── Categories ────────────────────────────────────────────────────────────────

export const getCategories = action({
  args: { token: v.optional(v.string()) },
  handler: async (_ctx, args) => {
    return await apiFetch("/api/categorias", {}, args.token);
  },
});

// ── Orders ────────────────────────────────────────────────────────────────────

export const createOrder = action({
  args: {
    token: v.string(),
    produtos: v.array(
      v.object({ produtoId: v.string(), quantidade: v.number() })
    ),
  },
  handler: async (_ctx, args) => {
    return await apiFetch(
      "/api/pedidos",
      { method: "POST", body: JSON.stringify({ produtos: args.produtos }) },
      args.token
    );
  },
});

export const getUserOrders = action({
  args: { token: v.string(), usuarioId: v.string() },
  handler: async (_ctx, args) => {
    return await apiFetch(
      `/api/pedidos/usuario/${args.usuarioId}`,
      {},
      args.token
    );
  },
});

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminCreateProduct = action({
  args: {
    token: v.string(),
    product: v.object({
      name: v.string(),
      price: v.number(),
      description: v.string(),
      category: v.string(),
      image: v.optional(v.string()),
      stock: v.optional(v.number()),
    }),
  },
  handler: async (_ctx, args) => {
    return await apiFetch(
      "/api/products",
      { method: "POST", body: JSON.stringify(args.product) },
      args.token
    );
  },
});

export const adminUpdateProduct = action({
  args: {
    token: v.string(),
    id: v.string(),
    product: v.object({
      name: v.optional(v.string()),
      price: v.optional(v.number()),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      image: v.optional(v.string()),
      stock: v.optional(v.number()),
    }),
  },
  handler: async (_ctx, args) => {
    return await apiFetch(
      `/api/products/${args.id}`,
      { method: "PUT", body: JSON.stringify(args.product) },
      args.token
    );
  },
});

export const adminDeleteProduct = action({
  args: { token: v.string(), id: v.string() },
  handler: async (_ctx, args) => {
    return await apiFetch(
      `/api/products/${args.id}`,
      { method: "DELETE" },
      args.token
    );
  },
});
