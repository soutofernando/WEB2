import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";

export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    createProduct = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { nome, preco, categoriaId, estoqueId } = req.body;

            if (!nome || categoriaId === undefined || estoqueId === undefined || preco === undefined || preco === null) {
                return res.status(400).json({
                    message: "Nome, preço, categoriaId e estoqueId são obrigatórios"
                });
            }

            if (isNaN(categoriaId) || isNaN(estoqueId)) {
                return res.status(400).json({
                    message: "categoriaId e estoqueId devem ser números válidos"
                });
            }

            const product = await this.productService.createProduct(nome, preco, categoriaId, estoqueId);
            return res.status(201).json({
                message: "Produto criado com sucesso",
                product
            });
        } catch (error: any) {
            console.error("Erro ao criar produto:", error);
            
            if (error.message.includes("não encontrada") || error.message.includes("não encontrado")) {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao criar o produto"
            });
        }
    };

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

    getProductsByCategory = async (req: Request, res: Response): Promise<Response> => {
        try {
            const categoriaId = parseInt(req.params.categoriaId);

            if (isNaN(categoriaId)) {
                return res.status(400).json({
                    message: "categoriaId inválido"
                });
            }

            const products = await this.productService.getProductsByCategory(categoriaId);
            return res.status(200).json({
                message: "Produtos obtidos com sucesso",
                products,
                count: products.length,
                categoriaId
            });
        } catch (error: any) {
            console.error("Erro ao obter produtos por categoria:", error);
            
            if (error.message === "Categoria não encontrada") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao obter os produtos"
            });
        }
    };

    updateProduct = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const { nome, preco, categoriaId, estoqueId } = req.body;

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            if (categoriaId !== undefined && isNaN(categoriaId)) {
                return res.status(400).json({
                    message: "categoriaId deve ser um número válido"
                });
            }

            if (estoqueId !== undefined && isNaN(estoqueId)) {
                return res.status(400).json({
                    message: "estoqueId deve ser um número válido"
                });
            }

            if (!nome && preco === undefined && categoriaId === undefined && estoqueId === undefined) {
                return res.status(400).json({
                    message: "Pelo menos um campo deve ser fornecido para atualização"
                });
            }

            const updatedProduct = await this.productService.updateProduct(id, nome, preco, categoriaId, estoqueId);
            return res.status(200).json({
                message: "Produto atualizado com sucesso",
                product: updatedProduct
            });
        } catch (error: any) {
            console.error("Erro ao atualizar produto:", error);
            
            if (error.message === "Produto não encontrado" || error.message.includes("não encontrada") || error.message.includes("não encontrado")) {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao atualizar o produto"
            });
        }
    };

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

