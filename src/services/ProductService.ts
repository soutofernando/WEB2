import { ProductRepository } from "../repository/ProductRepository";
import { CategoriaRepository } from "../repository/CategoriaRepository";
import { EstoqueRepository } from "../repository/EstoqueRepository";
import Product from "../models/Product";

export class ProductService {
    private productRepository: ProductRepository;
    private categoriaRepository: CategoriaRepository;
    private estoqueRepository: EstoqueRepository;

    constructor() {
        this.productRepository = new ProductRepository();
        this.categoriaRepository = new CategoriaRepository();
        this.estoqueRepository = new EstoqueRepository();
    }

    async createProduct(nome: string, preco: number, categoriaId: number, estoqueId: number): Promise<Product> {
        if (preco < 0) {
            throw new Error("Preço não pode ser negativo");
        }

        const categoria = await this.categoriaRepository.getCategoriaById(categoriaId);
        if (!categoria) {
            throw new Error("Categoria não encontrada");
        }

        const estoque = await this.estoqueRepository.getEstoqueById(estoqueId);
        if (!estoque) {
            throw new Error("Estoque não encontrado");
        }

        return await this.productRepository.createProduct(nome, preco, categoriaId, estoqueId);
    }

    async getAllProducts(): Promise<Product[]> {
        return await this.productRepository.getAllProducts();
    }

    async getProductById(id: number): Promise<Product | null> {
        const product = await this.productRepository.getProductById(id);
        if (!product) {
            throw new Error("Produto não encontrado");
        }

        return product;
    }

    async getProductsByCategory(categoriaId: number): Promise<Product[]> {
        const categoria = await this.categoriaRepository.getCategoriaById(categoriaId);
        if (!categoria) {
            throw new Error("Categoria não encontrada");
        }

        return await this.productRepository.getProductsByCategory(categoriaId);
    }

    async updateProduct(
        id: number,
        nome?: string,
        preco?: number,
        categoriaId?: number,
        estoqueId?: number
    ): Promise<Product> {
        if (preco !== undefined && preco < 0) {
            throw new Error("Preço não pode ser negativo");
        }

        if (categoriaId !== undefined) {
            const categoria = await this.categoriaRepository.getCategoriaById(categoriaId);
            if (!categoria) {
                throw new Error("Categoria não encontrada");
            }
        }

        if (estoqueId !== undefined) {
            const estoque = await this.estoqueRepository.getEstoqueById(estoqueId);
            if (!estoque) {
                throw new Error("Estoque não encontrado");
            }
        }

        const updatedProduct = await this.productRepository.updateProduct(id, nome, preco, categoriaId, estoqueId);
        
        if (!updatedProduct) {
            throw new Error("Produto não encontrado");
        }

        return updatedProduct;
    }

    async deleteProduct(id: number): Promise<boolean> {
        const deleted = await this.productRepository.deleteProduct(id);
        
        if (!deleted) {
            throw new Error("Produto não encontrado");
        }

        return true;
    }
}

