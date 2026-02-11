import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticate, requireAdmin, selfOrAdmin } from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

router.post("/", authenticate, requireAdmin, userController.createUser);
router.get("/", authenticate, requireAdmin, userController.getAllUsers);
router.delete("/:id", authenticate, requireAdmin, userController.deleteUser);
router.get("/:id", authenticate, selfOrAdmin, userController.getUserById);
router.get("/:id/resumo-pedidos", authenticate, selfOrAdmin, userController.getUserComResumoPedidos);
router.put("/:id", authenticate, selfOrAdmin, userController.updateUser);

export default router;

