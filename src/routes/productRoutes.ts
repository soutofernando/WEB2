import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();
const productController = new ProductController();

router.get("/", authenticate, productController.getAllProducts);
router.get("/category/:categoriaId", authenticate, productController.getProductsByCategory);
router.get("/:id", authenticate, productController.getProductById);
router.post("/", authenticate, requireAdmin, productController.createProduct);
router.put("/:id", authenticate, requireAdmin, productController.updateProduct);
router.delete("/:id", authenticate, requireAdmin, productController.deleteProduct);

export default router;

