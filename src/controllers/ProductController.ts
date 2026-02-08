import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";
import { parsePaginationParams } from "../types/pagination";

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
            if (error.message?.includes("não encontrada") || error.message?.includes("não encontrado")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message?.includes("Nome do produto") || error.message?.includes("Estoque já está vinculado")) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({
                message: error.message || "Erro ao criar o produto"
            });
        }
    };

    getAllProducts = async (req: Request, res: Response): Promise<Response> => {
        try {
            const pagination = parsePaginationParams(req.query as { page?: string; limit?: string });
            const nome = typeof req.query.nome === "string" && req.query.nome.trim() ? req.query.nome.trim() : undefined;
            const catId = req.query.categoriaId !== undefined ? parseInt(String(req.query.categoriaId), 10) : undefined;
            const categoriaId = catId !== undefined && !isNaN(catId) ? catId : undefined;
            const pMin = req.query.precoMin !== undefined ? parseFloat(String(req.query.precoMin)) : undefined;
            const precoMin = pMin !== undefined && !isNaN(pMin) ? pMin : undefined;
            const pMax = req.query.precoMax !== undefined ? parseFloat(String(req.query.precoMax)) : undefined;
            const precoMax = pMax !== undefined && !isNaN(pMax) ? pMax : undefined;

            const result = await this.productService.getProductsWithFiltersAndPagination(
                { nome, categoriaId, precoMin, precoMax },
                pagination
            );
            return res.status(200).json({
                message: "Produtos obtidos com sucesso",
                ...result
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
            if (error.message === "Produto não encontrado" || error.message?.includes("não encontrada") || error.message?.includes("não encontrado")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message?.includes("Nome do produto") || error.message?.includes("Estoque já está vinculado")) {
                return res.status(400).json({ message: error.message });
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
                return res.status(404).json({ message: error.message });
            }
            if (error.message?.includes("Produto está em") && error.message?.includes("pedido")) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({
                message: error.message || "Erro ao deletar o produto"
            });
        }
    };
}

