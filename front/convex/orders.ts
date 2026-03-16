import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const myOrders = query({
  args: { backendUserId: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (args.backendUserId != null) {
      return await ctx.db
        .query("orders")
        .withIndex("by_backend_user", (q) => q.eq("backendUserId", args.backendUserId!))
        .order("desc")
        .collect();
    }
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

const BACKEND_USER_SEP = "|||";

export const create = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        image: v.optional(v.string()),
      })
    ),
    total: v.number(),
    shippingAddress: v.object({
      name: v.string(),
      email: v.string(),
      address: v.string(),
      city: v.string(),
      zip: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const name = args.shippingAddress.name;
    const sepIndex = name.indexOf(BACKEND_USER_SEP);
    if (sepIndex !== -1) {
      const backendUserId = parseInt(name.slice(sepIndex + BACKEND_USER_SEP.length), 10);
      if (!Number.isNaN(backendUserId)) {
        const shippingAddress = {
          ...args.shippingAddress,
          name: name.slice(0, sepIndex).trim() || "Cliente",
        };
        return await ctx.db.insert("orders", {
          backendUserId,
          items: args.items,
          total: args.total,
          status: "pending",
          shippingAddress,
        });
      }
    }
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("orders", {
      userId,
      items: args.items,
      total: args.total,
      status: "pending",
      shippingAddress: args.shippingAddress,
    });
  },
});

export const allOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("orders").order("desc").collect();
  },
});
