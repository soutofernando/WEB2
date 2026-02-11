import { Router } from "express";
import { CategoriaController } from "../controllers/CategoriaController";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();
const categoriaController = new CategoriaController();

router.get("/", authenticate, categoriaController.getAllCategorias);
router.get("/:id/produtos", authenticate, categoriaController.getCategoriaComProdutos);
router.get("/:id", authenticate, categoriaController.getCategoriaById);
router.post("/", authenticate, requireAdmin, categoriaController.createCategoria);
router.put("/:id", authenticate, requireAdmin, categoriaController.updateCategoria);
router.delete("/:id", authenticate, requireAdmin, categoriaController.deleteCategoria);

export default router;

