import { EstoqueRepository } from "../repository/EstoqueRepository";
import { ProductRepository } from "../repository/ProductRepository";
import Estoque from "../models/Estoque";

export class EstoqueService {
    private estoqueRepository: EstoqueRepository;
    private productRepository: ProductRepository;

    constructor() {
        this.estoqueRepository = new EstoqueRepository();
        this.productRepository = new ProductRepository();
    }

    async createEstoque(quantidade: number, quantidadeMinima: number): Promise<Estoque> {
        if (quantidade < 0) {
            throw new Error("Quantidade não pode ser negativa");
        }

        if (quantidadeMinima < 0) {
            throw new Error("Quantidade mínima não pode ser negativa");
        }

        if (quantidadeMinima > quantidade) {
            throw new Error("Quantidade mínima não pode ser maior que a quantidade em estoque");
        }

        return await this.estoqueRepository.createEstoque(quantidade, quantidadeMinima);
    }

    async getAllEstoques(): Promise<Estoque[]> {
        return await this.estoqueRepository.getAllEstoques();
    }

    async getEstoqueById(id: number): Promise<Estoque | null> {
        const estoque = await this.estoqueRepository.getEstoqueById(id);
        if (!estoque) {
            throw new Error("Estoque não encontrado");
        }

        return estoque;
    }

    async getEstoqueComProdutos(id: number): Promise<{ estoque: Estoque; produtos: unknown[] }> {
        const estoque = await this.estoqueRepository.getEstoqueById(id);
        if (!estoque) {
            throw new Error("Estoque não encontrado");
        }

        const produtos = await this.productRepository.getProductsByEstoqueId(id);
        return { estoque, produtos };
    }

    async updateEstoque(id: number, quantidade?: number, quantidadeMinima?: number): Promise<Estoque> {
        if (quantidade !== undefined && quantidade < 0) {
            throw new Error("Quantidade não pode ser negativa");
        }

        if (quantidadeMinima !== undefined && quantidadeMinima < 0) {
            throw new Error("Quantidade mínima não pode ser negativa");
        }

        const estoqueAtual = await this.estoqueRepository.getEstoqueById(id);
        if (!estoqueAtual) {
            throw new Error("Estoque não encontrado");
        }

        const novaQuantidade = quantidade !== undefined ? quantidade : estoqueAtual.quantidade;
        const novaQuantidadeMinima = quantidadeMinima !== undefined ? quantidadeMinima : estoqueAtual.quantidadeMinima;

        if (novaQuantidadeMinima > novaQuantidade) {
            throw new Error("Quantidade mínima não pode ser maior que a quantidade em estoque");
        }

        const updatedEstoque = await this.estoqueRepository.updateEstoque(id, quantidade, quantidadeMinima);
        
        if (!updatedEstoque) {
            throw new Error("Estoque não encontrado");
        }

        return updatedEstoque;
    }

    async deleteEstoque(id: number): Promise<boolean> {
        const estoque = await this.estoqueRepository.getEstoqueById(id);
        if (!estoque) {
            throw new Error("Estoque não encontrado");
        }

        const produtosVinculados = await this.productRepository.getProductsByEstoqueId(id);
        if (produtosVinculados.length > 0) {
            const nomes = produtosVinculados.map((p: { nome: string }) => p.nome).join(", ");
            throw new Error(`Estoque está em uso por ${produtosVinculados.length} produto(s): ${nomes}. Remova ou altere os produtos antes de excluir o estoque.`);
        }

        const deleted = await this.estoqueRepository.deleteEstoque(id);
        if (!deleted) {
            throw new Error("Erro ao excluir o estoque");
        }

        return true;
    }
}

