import { Router } from "express";
import { PedidoController } from "../controllers/PedidoController";

const router = Router();
const pedidoController = new PedidoController();

router.post("/", pedidoController.createPedido);
router.get("/", pedidoController.getAllPedidos);
router.get("/usuario/:usuarioId", pedidoController.getPedidosByUsuario);
router.get("/:id", pedidoController.getPedidoById);
router.put("/:id/status", pedidoController.updatePedidoStatus);
router.delete("/:id", pedidoController.deletePedido);

export default router;

