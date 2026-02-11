import { Router } from "express";
import { PedidoController } from "../controllers/PedidoController";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();
const pedidoController = new PedidoController();

router.post("/", authenticate, pedidoController.createPedido);
router.get("/", authenticate, requireAdmin, pedidoController.getAllPedidos);
router.get("/usuario/:usuarioId", authenticate, pedidoController.getPedidosByUsuario);
router.get("/:id", authenticate, pedidoController.getPedidoById);
router.put("/:id/status", authenticate, requireAdmin, pedidoController.updatePedidoStatus);
router.delete("/:id", authenticate, requireAdmin, pedidoController.deletePedido);

export default router;

