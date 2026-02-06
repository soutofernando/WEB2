import Pedido from "../models/Pedido";
import PedidoProduto from "../models/PedidoProduto";
import Product from "../models/Product";
import User from "../models/User";
import Categoria from "../models/Categoria";
import Estoque from "../models/Estoque";

export class PedidoRepository {
    async createPedido(usuarioId: number, status?: string) {
        const pedido = await Pedido.create({
            usuarioId,
            status: status || "pendente",
            valorTotal: 0
        });
        return pedido;
    }

    async getAllPedidos() {
        return await Pedido.findAll({
            include: [
                { model: User, as: "usuario" },
                {
                    model: PedidoProduto,
                    as: "itens",
                    include: [
                        {
                            model: Product,
                            as: "produto",
                            include: [
                                { model: Categoria, as: "categoria" },
                                { model: Estoque, as: "estoque" }
                            ]
                        }
                    ]
                }
            ]
        });
    }

    async getPedidoById(id: number) {
        return await Pedido.findByPk(id, {
            include: [
                { model: User, as: "usuario" },
                {
                    model: PedidoProduto,
                    as: "itens",
                    include: [
                        {
                            model: Product,
                            as: "produto",
                            include: [
                                { model: Categoria, as: "categoria" },
                                { model: Estoque, as: "estoque" }
                            ]
                        }
                    ]
                }
            ]
        });
    }

    async getPedidosByUsuario(usuarioId: number) {
        return await Pedido.findAll({
            where: { usuarioId },
            include: [
                { model: User, as: "usuario" },
                {
                    model: PedidoProduto,
                    as: "itens",
                    include: [
                        {
                            model: Product,
                            as: "produto",
                            include: [
                                { model: Categoria, as: "categoria" },
                                { model: Estoque, as: "estoque" }
                            ]
                        }
                    ]
                }
            ]
        });
    }

    async addProdutoToPedido(pedidoId: number, produtoId: number, quantidade: number, precoUnitario: number) {
        const subtotal = quantidade * precoUnitario;
        const pedidoProduto = await PedidoProduto.create({
            pedidoId,
            produtoId,
            quantidade,
            precoUnitario,
            subtotal
        });
        return pedidoProduto;
    }

    async updatePedidoValorTotal(pedidoId: number, valorTotal: number) {
        const pedido = await Pedido.findByPk(pedidoId);
        if (!pedido) {
            return null;
        }
        pedido.valorTotal = valorTotal;
        await pedido.save();
        return pedido;
    }

    async updatePedidoStatus(id: number, status: string) {
        const pedido = await Pedido.findByPk(id);
        if (!pedido) {
            return null;
        }
        pedido.status = status;
        await pedido.save();
        return pedido;
    }

    async deletePedido(id: number) {
        const pedido = await Pedido.findByPk(id);
        if (!pedido) {
            return false;
        }

        await PedidoProduto.destroy({ where: { pedidoId: id } });
        await pedido.destroy();
        return true;
    }

    async getItensByPedido(pedidoId: number) {
        return await PedidoProduto.findAll({
            where: { pedidoId },
            include: [
                {
                    model: Product,
                    as: "produto",
                    include: [
                        { model: Categoria, as: "categoria" },
                        { model: Estoque, as: "estoque" }
                    ]
                }
            ]
        });
    }

    async getItensByProduto(produtoId: number) {
        return await PedidoProduto.findAll({ where: { produtoId } });
    }

    async removeItemFromPedido(pedidoId: number, itemId: number) {
        const item = await PedidoProduto.findOne({
            where: { id: itemId, pedidoId }
        });
        if (!item) {
            return false;
        }
        await item.destroy();
        return true;
    }
}

