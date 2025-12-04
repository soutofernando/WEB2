import { PedidoRepository } from "../repository/PedidoRepository";
import { ProductRepository } from "../repository/ProductRepository";
import { UserRepository } from "../repository/UserRepository";
import { EstoqueRepository } from "../repository/EstoqueRepository";
import Pedido from "../models/Pedido";
import PedidoProduto from "../models/PedidoProduto";

export class PedidoService {
    private pedidoRepository: PedidoRepository;
    private productRepository: ProductRepository;
    private userRepository: UserRepository;
    private estoqueRepository: EstoqueRepository;

    constructor() {
        this.pedidoRepository = new PedidoRepository();
        this.productRepository = new ProductRepository();
        this.userRepository = new UserRepository();
        this.estoqueRepository = new EstoqueRepository();
    }

    async createPedido(usuarioId: number, produtos: Array<{ produtoId: number; quantidade: number }>, status?: string): Promise<Pedido> {
        const usuario = await this.userRepository.getUserById(usuarioId);
        if (!usuario) {
            throw new Error("Usuário não encontrado");
        }

        if (!produtos || produtos.length === 0) {
            throw new Error("Um pedido deve conter pelo menos um produto");
        }

        const pedido = await this.pedidoRepository.createPedido(usuarioId, status);
        let valorTotal = 0;

        for (const item of produtos) {
            if (item.quantidade <= 0) {
                throw new Error("Quantidade deve ser maior que zero");
            }

            const produto = await this.productRepository.getProductById(item.produtoId);
            if (!produto) {
                throw new Error(`Produto com ID ${item.produtoId} não encontrado`);
            }

            const estoque = await this.estoqueRepository.getEstoqueById(produto.estoqueId);
            if (!estoque) {
                throw new Error("Estoque do produto não encontrado");
            }

            if (estoque.quantidade < item.quantidade) {
                throw new Error(`Estoque insuficiente para o produto ${produto.nome}. Disponível: ${estoque.quantidade}, Solicitado: ${item.quantidade}`);
            }

            const precoUnitario = Number(produto.preco);
            const subtotal = item.quantidade * precoUnitario;
            valorTotal += subtotal;

            await this.pedidoRepository.addProdutoToPedido(
                pedido.id,
                item.produtoId,
                item.quantidade,
                precoUnitario
            );

            estoque.quantidade -= item.quantidade;
            await estoque.save();
        }

        await this.pedidoRepository.updatePedidoValorTotal(pedido.id, valorTotal);

        return await this.pedidoRepository.getPedidoById(pedido.id) as Pedido;
    }

    async getAllPedidos(): Promise<Pedido[]> {
        return await this.pedidoRepository.getAllPedidos();
    }

    async getPedidoById(id: number): Promise<Pedido | null> {
        const pedido = await this.pedidoRepository.getPedidoById(id);
        if (!pedido) {
            throw new Error("Pedido não encontrado");
        }

        return pedido;
    }

    async getPedidosByUsuario(usuarioId: number): Promise<Pedido[]> {
        const usuario = await this.userRepository.getUserById(usuarioId);
        if (!usuario) {
            throw new Error("Usuário não encontrado");
        }

        return await this.pedidoRepository.getPedidosByUsuario(usuarioId);
    }

    async updatePedidoStatus(id: number, status: string): Promise<Pedido> {
        const statusValidos = ["pendente", "em_processamento", "enviado", "entregue", "cancelado"];
        if (!statusValidos.includes(status.toLowerCase())) {
            throw new Error(`Status inválido. Status válidos: ${statusValidos.join(", ")}`);
        }

        const updatedPedido = await this.pedidoRepository.updatePedidoStatus(id, status.toLowerCase());
        
        if (!updatedPedido) {
            throw new Error("Pedido não encontrado");
        }

        return await this.pedidoRepository.getPedidoById(id) as Pedido;
    }

    async deletePedido(id: number): Promise<boolean> {
        const pedido = await this.pedidoRepository.getPedidoById(id);
        if (!pedido) {
            throw new Error("Pedido não encontrado");
        }

        const itens = await this.pedidoRepository.getItensByPedido(id);
        
        for (const item of itens) {
            const produto = await this.productRepository.getProductById(item.produtoId);
            if (produto) {
                const estoque = await this.estoqueRepository.getEstoqueById(produto.estoqueId);
                if (estoque) {
                    estoque.quantidade += item.quantidade;
                    await estoque.save();
                }
            }
        }

        const deleted = await this.pedidoRepository.deletePedido(id);
        
        if (!deleted) {
            throw new Error("Erro ao deletar o pedido");
        }

        return true;
    }
}

