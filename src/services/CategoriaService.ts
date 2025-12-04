import { CategoriaRepository } from "../repository/CategoriaRepository";
import Categoria from "../models/Categoria";

export class CategoriaService {
    private categoriaRepository: CategoriaRepository;

    constructor() {
        this.categoriaRepository = new CategoriaRepository();
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

    async getCategoriaById(id: number): Promise<Categoria | null> {
        const categoria = await this.categoriaRepository.getCategoriaById(id);
        if (!categoria) {
            throw new Error("Categoria não encontrada");
        }

        return categoria;
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
        const deleted = await this.categoriaRepository.deleteCategoria(id);
        
        if (!deleted) {
            throw new Error("Categoria não encontrada");
        }

        return true;
    }
}

