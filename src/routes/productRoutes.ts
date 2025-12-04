import { Router } from "express";
import { ProductController } from "../controllers/ProductController";

const router = Router();
const productController = new ProductController();

router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/category/:categoriaId", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;

