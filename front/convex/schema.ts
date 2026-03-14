import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  products: defineTable({
    name: v.string(),
    price: v.number(),
    description: v.string(),
    category: v.string(),
    image: v.optional(v.string()),
    stock: v.number(),
  })
    .index("by_category", ["category"])
    .searchIndex("search_name", { searchField: "name", filterFields: ["category"] }),

  orders: defineTable({
    userId: v.id("users"),
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
    status: v.string(),
    shippingAddress: v.object({
      name: v.string(),
      email: v.string(),
      address: v.string(),
      city: v.string(),
      zip: v.string(),
      country: v.string(),
    }),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
