import { Request, Response } from "express";
import { CategoriaService } from "../services/CategoriaService";
import { parsePaginationParams } from "../types/pagination";

export class CategoriaController {
    private categoriaService: CategoriaService;

    constructor() {
        this.categoriaService = new CategoriaService();
    }

    createCategoria = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { nome, descricao } = req.body;

            if (!nome) {
                return res.status(400).json({
                    message: "Nome é obrigatório"
                });
            }

            const categoria = await this.categoriaService.createCategoria(nome, descricao);
            return res.status(201).json({
                message: "Categoria criada com sucesso",
                categoria
            });
        } catch (error: any) {
            console.error("Erro ao criar categoria:", error);
            
            if (error.message.includes("já existe")) {
                return res.status(409).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao criar a categoria"
            });
        }
    };

    getAllCategorias = async (req: Request, res: Response): Promise<Response> => {
        try {
            const pagination = parsePaginationParams(req.query as { page?: string; limit?: string });
            const nome = typeof req.query.nome === "string" && req.query.nome.trim() ? req.query.nome.trim() : undefined;

            const result = await this.categoriaService.getCategoriasWithFiltersAndPagination(
                { nome },
                pagination
            );
            return res.status(200).json({
                message: "Categorias obtidas com sucesso",
                ...result
            });
        } catch (error: any) {
            console.error("Erro ao obter categorias:", error);
            return res.status(500).json({
                message: error.message || "Erro ao obter as categorias"
            });
        }
    };

    getCategoriaById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            const categoria = await this.categoriaService.getCategoriaById(id);
            return res.status(200).json({
                message: "Categoria obtida com sucesso",
                categoria
            });
        } catch (error: any) {
            console.error("Erro ao obter categoria:", error);
            
            if (error.message === "Categoria não encontrada") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao obter a categoria"
            });
        }
    };

    updateCategoria = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const { nome, descricao } = req.body;

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            if (!nome && descricao === undefined) {
                return res.status(400).json({
                    message: "Pelo menos um campo deve ser fornecido para atualização"
                });
            }

            const updatedCategoria = await this.categoriaService.updateCategoria(id, nome, descricao);
            return res.status(200).json({
                message: "Categoria atualizada com sucesso",
                categoria: updatedCategoria
            });
        } catch (error: any) {
            console.error("Erro ao atualizar categoria:", error);
            
            if (error.message === "Categoria não encontrada") {
                return res.status(404).json({
                    message: error.message
                });
            }

            if (error.message.includes("já existe")) {
                return res.status(409).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao atualizar a categoria"
            });
        }
    };

    deleteCategoria = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            await this.categoriaService.deleteCategoria(id);
            return res.status(200).json({
                message: "Categoria deletada com sucesso"
            });
        } catch (error: any) {
            console.error("Erro ao deletar categoria:", error);
            if (error.message === "Categoria não encontrada") {
                return res.status(404).json({ message: error.message });
            }
            if (error.message?.includes("Categoria está em uso")) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({
                message: error.message || "Erro ao deletar a categoria"
            });
        }
    };

    getCategoriaComProdutos = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ message: "ID inválido" });
            }
            const resultado = await this.categoriaService.getCategoriaComProdutos(id);
            return res.status(200).json({
                message: "Categoria obtida com sucesso",
                ...resultado
            });
        } catch (error: any) {
            if (error.message === "Categoria não encontrada") {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: error.message || "Erro ao obter a categoria" });
        }
    };
}

