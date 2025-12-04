import { Request, Response } from "express";
import { EstoqueService } from "../services/EstoqueService";

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
            return res.status(500).json({
                message: error.message || "Erro ao criar o estoque"
            });
        }
    };

    getAllEstoques = async (req: Request, res: Response): Promise<Response> => {
        try {
            const estoques = await this.estoqueService.getAllEstoques();
            return res.status(200).json({
                message: "Estoques obtidos com sucesso",
                estoques,
                count: estoques.length
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
                return res.status(404).json({
                    message: error.message
                });
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
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao deletar o estoque"
            });
        }
    };
}

