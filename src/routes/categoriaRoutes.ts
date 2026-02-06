import { Router } from "express";
import { CategoriaController } from "../controllers/CategoriaController";

const router = Router();
const categoriaController = new CategoriaController();

router.post("/", categoriaController.createCategoria);
router.get("/", categoriaController.getAllCategorias);
router.get("/:id/produtos", categoriaController.getCategoriaComProdutos);
router.get("/:id", categoriaController.getCategoriaById);
router.put("/:id", categoriaController.updateCategoria);
router.delete("/:id", categoriaController.deleteCategoria);

export default router;

