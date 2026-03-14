import { Op } from "sequelize";
import Categoria from "../models/Categoria";

export interface CategoriaFilters {
    nome?: string;
}

export interface CategoriaListOptions {
    filters?: CategoriaFilters;
    limit?: number;
    offset?: number;
}

export class CategoriaRepository {
    async createCategoria(nome: string, descricao?: string) {
        const categoria = await Categoria.create({
            nome,
            descricao
        });
        return categoria;
    }

    async getAllCategorias() {
        return await Categoria.findAll();
    }

    async getCategoriasWithFiltersAndPagination(options: CategoriaListOptions) {
        const { filters = {}, limit = 10, offset = 0 } = options;
        const where: Record<string, unknown> = {};

        if (filters.nome?.trim()) {
            where.nome = { [Op.like]: `%${filters.nome.trim()}%` };
        }

        const { count, rows } = await Categoria.findAndCountAll({
            where: Object.keys(where).length ? where : undefined,
            limit,
            offset
        });
        return { rows, count };
    }

    async getCategoriaById(id: number) {
        return await Categoria.findByPk(id);
    }

    async getCategoriaByNome(nome: string) {
        return await Categoria.findOne({ where: { nome } });
    }

    async updateCategoria(id: number, nome?: string, descricao?: string) {
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return null;
        }

        if (nome) categoria.nome = nome;
        if (descricao !== undefined) categoria.descricao = descricao;

        await categoria.save();
        return categoria;
    }

    async deleteCategoria(id: number) {
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return false;
        }

        await categoria.destroy();
        return true;
    }
}

