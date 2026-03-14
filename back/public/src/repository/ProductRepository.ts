import { Op } from "sequelize";
import Product from "../models/Product";
import Categoria from "../models/Categoria";
import Estoque from "../models/Estoque";

export interface ProductFilters {
    nome?: string;
    categoriaId?: number;
    precoMin?: number;
    precoMax?: number;
}

export interface ProductListOptions {
    filters?: ProductFilters;
    limit?: number;
    offset?: number;
}

export class ProductRepository {
    async createProduct(nome: string, preco: number, categoriaId: number, estoqueId: number) {
        const product = await Product.create({
            nome,
            preco,
            categoriaId,
            estoqueId
        });
        return product;
    }

    async getAllProducts() {
        return await Product.findAll({
            include: [
                { model: Categoria, as: "categoria" },
                { model: Estoque, as: "estoque" }
            ]
        });
    }

    async getProductsWithFiltersAndPagination(options: ProductListOptions) {
        const { filters = {}, limit = 10, offset = 0 } = options;
        const where: Record<string, unknown> = {};

        if (filters.nome?.trim()) {
            where.nome = { [Op.like]: `%${filters.nome.trim()}%` };
        }
        if (filters.categoriaId !== undefined && filters.categoriaId !== null) {
            where.categoriaId = filters.categoriaId;
        }
        if (filters.precoMin !== undefined && filters.precoMin !== null) {
            where.preco = { [Op.gte]: filters.precoMin };
        }
        if (filters.precoMax !== undefined && filters.precoMax !== null) {
            where.preco = where.preco
                ? { ...(where.preco as object), [Op.lte]: filters.precoMax }
                : { [Op.lte]: filters.precoMax };
        }

        const { count, rows } = await Product.findAndCountAll({
            where: Object.keys(where).length ? where : undefined,
            include: [
                { model: Categoria, as: "categoria" },
                { model: Estoque, as: "estoque" }
            ],
            limit,
            offset
        });
        return { rows, count };
    }

    async getProductById(id: number) {
        return await Product.findByPk(id, {
            include: [
                { model: Categoria, as: "categoria" },
                { model: Estoque, as: "estoque" }
            ]
        });
    }

    async getProductsByCategory(categoriaId: number) {
        return await Product.findAll({
            where: { categoriaId },
            include: [
                { model: Categoria, as: "categoria" },
                { model: Estoque, as: "estoque" }
            ]
        });
    }

    async getProductByEstoqueId(estoqueId: number) {
        return await Product.findOne({ where: { estoqueId } });
    }

    async getProductsByEstoqueId(estoqueId: number) {
        return await Product.findAll({
            where: { estoqueId },
            include: [
                { model: Categoria, as: "categoria" },
                { model: Estoque, as: "estoque" }
            ]
        });
    }

    async updateProduct(id: number, nome?: string, preco?: number, categoriaId?: number, estoqueId?: number) {
        const product = await Product.findByPk(id);
        if (!product) {
            return null;
        }

        if (nome) product.nome = nome;
        if (preco !== undefined) product.preco = preco;
        if (categoriaId !== undefined) product.categoriaId = categoriaId;
        if (estoqueId !== undefined) product.estoqueId = estoqueId;

        await product.save();
        return await Product.findByPk(id, {
            include: [
                { model: Categoria, as: "categoria" },
                { model: Estoque, as: "estoque" }
            ]
        });
    }

    async deleteProduct(id: number) {
        const product = await Product.findByPk(id);
        if (!product) {
            return false;
        }

        await product.destroy();
        return true;
    }
}

