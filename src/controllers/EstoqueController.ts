import { Request, Response } from "express";
import { EstoqueService } from "../services/EstoqueService";
import { parsePaginationParams } from "../types/pagination";

export class EstoqueController {
    private estoqueService: EstoqueService;

    constructor() {
        this.estoqueService = new EstoqueService();
    }

    createEstoque = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { quantidade, quantidadeMinima } = req.body;

            if (quantidade === undefined || quantidade === null) {
                return res.status(400).json({
                    message: "Quantidade é obrigatória"
                });
            }

            if (quantidadeMinima === undefined || quantidadeMinima === null) {
                return res.status(400).json({
                    message: "Quantidade mínima é obrigatória"
                });
            }

            const estoque = await this.estoqueService.createEstoque(quantidade, quantidadeMinima);
            return res.status(201).json({
                message: "Estoque criado com sucesso",
                estoque
            });
        } catch (error: any) {
            console.error("Erro ao criar estoque:", error);
            if (error.message?.includes("Quantidade mínima não pode ser maior")) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({
                message: error.message || "Erro ao criar o estoque"
            });
        }
    };

    getAllEstoques = async (req: Request, res: Response): Promise<Response> => {
        try {
            const pagination = parsePaginationParams(req.query as { page?: string; limit?: string });
            const baixoEstoque = req.query.baixoEstoque === "true" || req.query.baixoEstoque === "1";

            const result = await this.estoqueService.getEstoquesWithFiltersAndPagination(
                { baixoEstoque: baixoEstoque || undefined },
                pagination
            );
            return res.status(200).json({
                message: "Estoques obtidos com sucesso",
                ...result
            });
        } catch (error: any) {
            console.error("Erro ao obter estoques:", error);
            return res.status(500).json({
                message: error.message || "Erro ao obter os estoques"
            });
        }
    };

    getEstoqueById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            const estoque = await this.estoqueService.getEstoqueById(id);
            return res.status(200).json({
                message: "Estoque obtido com sucesso",
                estoque
            });
        } catch (error: any) {
            console.error("Erro ao obter estoque:", error);
            
            if (error.message === "Estoque não encontrado") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao obter o estoque"
            });
        }
    };

    updateEstoque = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const { quantidade, quantidadeMinima } = req.body;

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            if (quantidade === undefined && quantidadeMinima === undefined) {
                return res.status(400).json({
                    message: "Pelo menos um campo deve ser fornecido para atualização"
                });
            }

            const updatedEstoque = await this.estoqueService.updateEstoque(id, quantidade, quantidadeMinima);
            return res.status(200).json({
                message: "Estoque atualizado com sucesso",
                estoque: updatedEstoque
            });
        } catch (error: any) {
            console.error("Erro ao atualizar estoque:", error);
            if (error.message === "Estoque não encontrado") {
                return res.status(404).json({ message: error.message });
            }
            if (error.message?.includes("Quantidade mínima não pode ser maior")) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({
                message: error.message || "Erro ao atualizar o estoque"
            });
        }
    };

    deleteEstoque = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            await this.estoqueService.deleteEstoque(id);
            return res.status(200).json({
                message: "Estoque deletado com sucesso"
            });
        } catch (error: any) {
            console.error("Erro ao deletar estoque:", error);
            if (error.message === "Estoque não encontrado") {
                return res.status(404).json({ message: error.message });
            }
            if (error.message?.includes("Estoque está em uso")) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({
                message: error.message || "Erro ao deletar o estoque"
            });
        }
    };

    getEstoqueComProdutos = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ message: "ID inválido" });
            }
            const resultado = await this.estoqueService.getEstoqueComProdutos(id);
            return res.status(200).json({
                message: "Estoque obtido com sucesso",
                ...resultado
            });
        } catch (error: any) {
            if (error.message === "Estoque não encontrado") {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: error.message || "Erro ao obter o estoque" });
        }
    };
}

