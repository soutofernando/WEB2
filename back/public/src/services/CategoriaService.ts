import { CategoriaRepository, CategoriaFilters } from "../repository/CategoriaRepository";
import { ProductRepository } from "../repository/ProductRepository";
import Categoria from "../models/Categoria";
import { PaginationParams, PaginationResult, buildPaginationResult } from "../types/pagination";

export class CategoriaService {
    private categoriaRepository: CategoriaRepository;
    private productRepository: ProductRepository;

    constructor() {
        this.categoriaRepository = new CategoriaRepository();
        this.productRepository = new ProductRepository();
    }

    async createCategoria(nome: string, descricao?: string): Promise<Categoria> {
        const existingCategoria = await this.categoriaRepository.getCategoriaByNome(nome);
        
        if (existingCategoria) {
            throw new Error("Categoria com este nome já existe");
        }

        return await this.categoriaRepository.createCategoria(nome, descricao);
    }

    async getAllCategorias(): Promise<Categoria[]> {
        return await this.categoriaRepository.getAllCategorias();
    }

    async getCategoriasWithFiltersAndPagination(
        filters: CategoriaFilters,
        pagination: PaginationParams
    ): Promise<PaginationResult<Categoria>> {
        const { rows, count } = await this.categoriaRepository.getCategoriasWithFiltersAndPagination({
            filters,
            limit: pagination.limit,
            offset: pagination.offset
        });
        return buildPaginationResult(rows as Categoria[], count, pagination.page, pagination.limit);
    }

    async getCategoriaById(id: number): Promise<Categoria | null> {
        const categoria = await this.categoriaRepository.getCategoriaById(id);
        if (!categoria) {
            throw new Error("Categoria não encontrada");
        }

        return categoria;
    }

    async getCategoriaComProdutos(id: number): Promise<{ categoria: Categoria; produtos: unknown[]; totalProdutos: number }> {
        const categoria = await this.categoriaRepository.getCategoriaById(id);
        if (!categoria) {
            throw new Error("Categoria não encontrada");
        }

        const produtos = await this.productRepository.getProductsByCategory(id);
        return { categoria, produtos, totalProdutos: produtos.length };
    }

    async updateCategoria(id: number, nome?: string, descricao?: string): Promise<Categoria> {
        if (nome) {
            const existingCategoria = await this.categoriaRepository.getCategoriaByNome(nome);
            
            if (existingCategoria && existingCategoria.id !== id) {
                throw new Error("Categoria com este nome já existe");
            }
        }

        const updatedCategoria = await this.categoriaRepository.updateCategoria(id, nome, descricao);
        
        if (!updatedCategoria) {
            throw new Error("Categoria não encontrada");
        }

        return updatedCategoria;
    }

    async deleteCategoria(id: number): Promise<boolean> {
        const categoria = await this.categoriaRepository.getCategoriaById(id);
        if (!categoria) {
            throw new Error("Categoria não encontrada");
        }

        const produtosVinculados = await this.productRepository.getProductsByCategory(id);
        if (produtosVinculados.length > 0) {
            const nomes = produtosVinculados.map((p: { nome: string }) => p.nome).join(", ");
            throw new Error(`Categoria está em uso por ${produtosVinculados.length} produto(s): ${nomes}. Remova ou altere a categoria dos produtos antes de excluir.`);
        }

        const deleted = await this.categoriaRepository.deleteCategoria(id);
        if (!deleted) {
            throw new Error("Erro ao excluir a categoria");
        }

        return true;
    }
}

