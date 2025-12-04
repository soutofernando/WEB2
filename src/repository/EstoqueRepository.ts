import Estoque from "../models/Estoque";

export class EstoqueRepository {
    async createEstoque(quantidade: number, quantidadeMinima: number) {
        const estoque = await Estoque.create({
            quantidade,
            quantidadeMinima
        });
        return estoque;
    }

    async getAllEstoques() {
        return await Estoque.findAll();
    }

    async getEstoqueById(id: number) {
        return await Estoque.findByPk(id);
    }

    async updateEstoque(id: number, quantidade?: number, quantidadeMinima?: number) {
        const estoque = await Estoque.findByPk(id);
        if (!estoque) {
            return null;
        }

        if (quantidade !== undefined) estoque.quantidade = quantidade;
        if (quantidadeMinima !== undefined) estoque.quantidadeMinima = quantidadeMinima;

        await estoque.save();
        return estoque;
    }

    async deleteEstoque(id: number) {
        const estoque = await Estoque.findByPk(id);
        if (!estoque) {
            return false;
        }

        await estoque.destroy();
        return true;
    }
}

