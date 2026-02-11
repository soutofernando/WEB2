import { Request, Response } from "express";
import { PedidoService } from "../services/PedidoService";
import { parsePaginationParams } from "../types/pagination";

export class PedidoController {
    private pedidoService: PedidoService;

    constructor() {
        this.pedidoService = new PedidoService();
    }

    createPedido = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { usuarioId: bodyUsuarioId, produtos, status } = req.body;
            const isAdmin = req.user?.role === "admin";
            const usuarioId = isAdmin && bodyUsuarioId !== undefined && bodyUsuarioId !== null
                ? (isNaN(Number(bodyUsuarioId)) ? req.user!.id : Number(bodyUsuarioId))
                : req.user!.id;

            if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
                return res.status(400).json({
                    message: "Um pedido deve conter pelo menos um produto. O campo 'produtos' deve ser um array com objetos contendo 'produtoId' e 'quantidade'"
                });
            }

            for (const produto of produtos) {
                if (!produto.produtoId || produto.quantidade === undefined) {
                    return res.status(400).json({
                        message: "Cada produto deve conter 'produtoId' e 'quantidade'"
                    });
                }

                if (isNaN(produto.produtoId) || isNaN(produto.quantidade)) {
                    return res.status(400).json({
                        message: "produtoId e quantidade devem ser números válidos"
                    });
                }
            }

            const pedido = await this.pedidoService.createPedido(usuarioId, produtos, status);
            return res.status(201).json({
                message: "Pedido criado com sucesso",
                pedido
            });
        } catch (error: any) {
            console.error("Erro ao criar pedido:", error);
            
            if (error.message.includes("não encontrado") || error.message.includes("não encontrada")) {
                return res.status(404).json({
                    message: error.message
                });
            }

            if (error.message.includes("Estoque insuficiente") || error.message.includes("deve conter")) {
                return res.status(400).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao criar o pedido"
            });
        }
    };

    getAllPedidos = async (req: Request, res: Response): Promise<Response> => {
        try {
            const pagination = parsePaginationParams(req.query as { page?: string; limit?: string });
            const status = typeof req.query.status === "string" && req.query.status.trim() ? req.query.status.trim() : undefined;
            const usuarioIdParam = req.query.usuarioId !== undefined ? parseInt(String(req.query.usuarioId), 10) : undefined;
            const usuarioId = usuarioIdParam !== undefined && !isNaN(usuarioIdParam) ? usuarioIdParam : undefined;

            const result = await this.pedidoService.getPedidosWithFiltersAndPagination(
                { status, usuarioId },
                pagination
            );
            return res.status(200).json({
                message: "Pedidos obtidos com sucesso",
                ...result
            });
        } catch (error: any) {
            console.error("Erro ao obter pedidos:", error);
            return res.status(500).json({
                message: error.message || "Erro ao obter os pedidos"
            });
        }
    };

    getPedidoById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            const pedido = await this.pedidoService.getPedidoById(id);
            const isAdmin = req.user?.role === "admin";
            const isOwner = pedido && Number(pedido.usuarioId) === req.user?.id;
            if (!isAdmin && !isOwner) {
                return res.status(403).json({ message: "Acesso negado. Você só pode visualizar seus próprios pedidos." });
            }
            return res.status(200).json({
                message: "Pedido obtido com sucesso",
                pedido
            });
        } catch (error: any) {
            console.error("Erro ao obter pedido:", error);
            
            if (error.message === "Pedido não encontrado") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao obter o pedido"
            });
        }
    };

    getPedidosByUsuario = async (req: Request, res: Response): Promise<Response> => {
        try {
            const usuarioId = parseInt(req.params.usuarioId);

            if (isNaN(usuarioId)) {
                return res.status(400).json({
                    message: "usuarioId inválido"
                });
            }

            const isAdmin = req.user?.role === "admin";
            if (!isAdmin && usuarioId !== req.user?.id) {
                return res.status(403).json({ message: "Acesso negado. Você só pode listar seus próprios pedidos." });
            }

            const pedidos = await this.pedidoService.getPedidosByUsuario(usuarioId);
            return res.status(200).json({
                message: "Pedidos obtidos com sucesso",
                pedidos,
                count: pedidos.length
            });
        } catch (error: any) {
            console.error("Erro ao obter pedidos do usuário:", error);
            
            if (error.message === "Usuário não encontrado") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao obter os pedidos"
            });
        }
    };

    updatePedidoStatus = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            if (!status) {
                return res.status(400).json({
                    message: "Status é obrigatório"
                });
            }

            const updatedPedido = await this.pedidoService.updatePedidoStatus(id, status);
            return res.status(200).json({
                message: "Status do pedido atualizado com sucesso",
                pedido: updatedPedido
            });
        } catch (error: any) {
            console.error("Erro ao atualizar status do pedido:", error);
            
            if (error.message === "Pedido não encontrado") {
                return res.status(404).json({
                    message: error.message
                });
            }

            if (error.message.includes("Status inválido")) {
                return res.status(400).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao atualizar o status do pedido"
            });
        }
    };

    deletePedido = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            await this.pedidoService.deletePedido(id);
            return res.status(200).json({
                message: "Pedido deletado com sucesso"
            });
        } catch (error: any) {
            console.error("Erro ao deletar pedido:", error);
            
            if (error.message === "Pedido não encontrado") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao deletar o pedido"
            });
        }
    };
}

