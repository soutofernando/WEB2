import { Router } from "express";
import { EstoqueController } from "../controllers/EstoqueController";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();
const estoqueController = new EstoqueController();

router.post("/", authenticate, requireAdmin, estoqueController.createEstoque);
router.get("/", authenticate, requireAdmin, estoqueController.getAllEstoques);
router.get("/:id/produtos", authenticate, requireAdmin, estoqueController.getEstoqueComProdutos);
router.get("/:id", authenticate, requireAdmin, estoqueController.getEstoqueById);
router.put("/:id", authenticate, requireAdmin, estoqueController.updateEstoque);
router.delete("/:id", authenticate, requireAdmin, estoqueController.deleteEstoque);

export default router;

