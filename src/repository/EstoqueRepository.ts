import { Op } from "sequelize";
import sequelize from "../config/database";
import Estoque from "../models/Estoque";

export interface EstoqueFilters {
    baixoEstoque?: boolean;
}

export interface EstoqueListOptions {
    filters?: EstoqueFilters;
    limit?: number;
    offset?: number;
}

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

    async getEstoquesWithFiltersAndPagination(options: EstoqueListOptions) {
        const { filters = {}, limit = 10, offset = 0 } = options;
        const where =
            filters.baixoEstoque === true
                ? sequelize.where(sequelize.col("quantidade"), Op.lte, sequelize.col("quantidadeMinima"))
                : undefined;

        const { count, rows } = await Estoque.findAndCountAll({
            where,
            limit,
            offset
        });
        return { rows, count };
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

