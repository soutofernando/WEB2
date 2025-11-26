import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";

export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    // Criar um novo produto
    createProduct = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { nome, preco, categoria } = req.body;

            if (!nome || !categoria || preco === undefined || preco === null) {
                return res.status(400).json({
                    message: "Nome, preço e categoria são obrigatórios"
                });
            }

            const product = await this.productService.createProduct(nome, preco, categoria);
            return res.status(201).json({
                message: "Produto criado com sucesso",
                product
            });
        } catch (error: any) {
            console.error("Erro ao criar produto:", error);
            return res.status(500).json({
                message: error.message || "Erro ao criar o produto"
            });
        }
    };

    // Listar todos os produtos
    getAllProducts = async (req: Request, res: Response): Promise<Response> => {
        try {
            const products = await this.productService.getAllProducts();
            return res.status(200).json({
                message: "Produtos obtidos com sucesso",
                products,
                count: products.length
            });
        } catch (error: any) {
            console.error("Erro ao obter produtos:", error);
            return res.status(500).json({
                message: error.message || "Erro ao obter os produtos"
            });
        }
    };

    // Buscar produto por ID
    getProductById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            const product = await this.productService.getProductById(id);
            return res.status(200).json({
                message: "Produto obtido com sucesso",
                product
            });
        } catch (error: any) {
            console.error("Erro ao obter produto:", error);
            
            if (error.message === "Produto não encontrado") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao obter o produto"
            });
        }
    };

    // Buscar produtos por categoria
    getProductsByCategory = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { categoria } = req.params;

            if (!categoria) {
                return res.status(400).json({
                    message: "Categoria é obrigatória"
                });
            }

            const products = await this.productService.getProductsByCategory(categoria);
            return res.status(200).json({
                message: "Produtos obtidos com sucesso",
                products,
                count: products.length,
                categoria
            });
        } catch (error: any) {
            console.error("Erro ao obter produtos por categoria:", error);
            return res.status(500).json({
                message: error.message || "Erro ao obter os produtos"
            });
        }
    };

    // Atualizar produto
    updateProduct = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const { nome, preco, categoria } = req.body;

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            if (!nome && preco === undefined && !categoria) {
                return res.status(400).json({
                    message: "Pelo menos um campo deve ser fornecido para atualização"
                });
            }

            const updatedProduct = await this.productService.updateProduct(id, nome, preco, categoria);
            return res.status(200).json({
                message: "Produto atualizado com sucesso",
                product: updatedProduct
            });
        } catch (error: any) {
            console.error("Erro ao atualizar produto:", error);
            
            if (error.message === "Produto não encontrado") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao atualizar o produto"
            });
        }
    };

    // Deletar produto
    deleteProduct = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            await this.productService.deleteProduct(id);
            return res.status(200).json({
                message: "Produto deletado com sucesso"
            });
        } catch (error: any) {
            console.error("Erro ao deletar produto:", error);
            
            if (error.message === "Produto não encontrado") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao deletar o produto"
            });
        }
    };
}

