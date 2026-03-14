import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.search) {
      return await ctx.db
        .query("products")
        .withSearchIndex("search_name", (q) => {
          let sq = q.search("name", args.search!);
          if (args.category && args.category !== "All") {
            sq = sq.eq("category", args.category);
          }
          return sq;
        })
        .take(50);
    }
    if (args.category && args.category !== "All") {
      return await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    }
    return await ctx.db.query("products").collect();
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const categories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return cats.sort();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    description: v.string(),
    category: v.string(),
    image: v.optional(v.string()),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("products", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    image: v.optional(v.string()),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.id);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").take(1);
    if (existing.length > 0) return;
    const products = [
      { name: "Wireless Headphones", price: 79.99, description: "Premium sound quality with active noise cancellation and 30-hour battery life.", category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", stock: 25 },
      { name: "Running Shoes", price: 129.99, description: "Lightweight and breathable running shoes with responsive cushioning for all-day comfort.", category: "Sports", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", stock: 40 },
      { name: "Leather Wallet", price: 49.99, description: "Slim genuine leather wallet with RFID blocking and multiple card slots.", category: "Accessories", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80", stock: 60 },
      { name: "Smart Watch", price: 199.99, description: "Feature-packed smartwatch with health tracking, GPS, and 5-day battery life.", category: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", stock: 15 },
      { name: "Sunglasses", price: 89.99, description: "UV400 polarized sunglasses with lightweight titanium frame.", category: "Accessories", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80", stock: 30 },
      { name: "Backpack", price: 59.99, description: "Durable 30L backpack with laptop compartment and ergonomic straps.", category: "Bags", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", stock: 20 },
      { name: "Coffee Maker", price: 149.99, description: "Programmable 12-cup coffee maker with built-in grinder and thermal carafe.", category: "Home", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80", stock: 10 },
      { name: "Yoga Mat", price: 39.99, description: "Non-slip 6mm thick yoga mat with alignment lines and carrying strap.", category: "Sports", image: "https://images.unsplash.com/photo-1601925228008-f5e4c5e5e5e5?w=600&q=80", stock: 50 },
      { name: "Desk Lamp", price: 34.99, description: "LED desk lamp with adjustable brightness, color temperature, and USB charging port.", category: "Home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80", stock: 35 },
      { name: "Tote Bag", price: 29.99, description: "Eco-friendly canvas tote bag with reinforced handles and inner pocket.", category: "Bags", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80", stock: 80 },
      { name: "Bluetooth Speaker", price: 69.99, description: "Waterproof portable speaker with 360° sound and 12-hour playtime.", category: "Electronics", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80", stock: 22 },
      { name: "Water Bottle", price: 24.99, description: "Insulated stainless steel water bottle that keeps drinks cold 24h or hot 12h.", category: "Sports", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80", stock: 100 },
    ];
    for (const p of products) {
      await ctx.db.insert("products", p);
    }
  },
});
