import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();
const userController = new UserController();

router.post("/", userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/:id/resumo-pedidos", userController.getUserComResumoPedidos);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;

