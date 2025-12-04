import { EstoqueRepository } from "../repository/EstoqueRepository";
import Estoque from "../models/Estoque";

export class EstoqueService {
    private estoqueRepository: EstoqueRepository;

    constructor() {
        this.estoqueRepository = new EstoqueRepository();
    }

    async createEstoque(quantidade: number, quantidadeMinima: number): Promise<Estoque> {
        if (quantidade < 0) {
            throw new Error("Quantidade não pode ser negativa");
        }

        if (quantidadeMinima < 0) {
            throw new Error("Quantidade mínima não pode ser negativa");
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

    async updateEstoque(id: number, quantidade?: number, quantidadeMinima?: number): Promise<Estoque> {
        if (quantidade !== undefined && quantidade < 0) {
            throw new Error("Quantidade não pode ser negativa");
        }

        if (quantidadeMinima !== undefined && quantidadeMinima < 0) {
            throw new Error("Quantidade mínima não pode ser negativa");
        }

        const updatedEstoque = await this.estoqueRepository.updateEstoque(id, quantidade, quantidadeMinima);
        
        if (!updatedEstoque) {
            throw new Error("Estoque não encontrado");
        }

        return updatedEstoque;
    }

    async deleteEstoque(id: number): Promise<boolean> {
        const deleted = await this.estoqueRepository.deleteEstoque(id);
        
        if (!deleted) {
            throw new Error("Estoque não encontrado");
        }

        return true;
    }
}

