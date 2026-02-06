import { Router } from "express";
import { EstoqueController } from "../controllers/EstoqueController";

const router = Router();
const estoqueController = new EstoqueController();

router.post("/", estoqueController.createEstoque);
router.get("/", estoqueController.getAllEstoques);
router.get("/:id/produtos", estoqueController.getEstoqueComProdutos);
router.get("/:id", estoqueController.getEstoqueById);
router.put("/:id", estoqueController.updateEstoque);
router.delete("/:id", estoqueController.deleteEstoque);

export default router;

