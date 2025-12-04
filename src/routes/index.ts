import { Router } from "express";
import userRoutes from "./userRoutes";
import productRoutes from "./productRoutes";
import categoriaRoutes from "./categoriaRoutes";
import estoqueRoutes from "./estoqueRoutes";
import pedidoRoutes from "./pedidoRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/estoques", estoqueRoutes);
router.use("/pedidos", pedidoRoutes);

export default router;

