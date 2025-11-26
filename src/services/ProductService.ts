import { ProductRepository } from "../repository/ProductRepository";
import Product from "../models/Product";

export class ProductService {
    private productRepository: ProductRepository;

    constructor() {
        this.productRepository = new ProductRepository();
    }

    // Criar um novo produto
    async createProduct(nome: string, preco: number, categoria: string): Promise<Product> {
        // Validações básicas
        if (!nome || !categoria) {
            throw new Error("Nome e categoria são obrigatórios");
        }

        if (preco === undefined || preco === null) {
            throw new Error("Preço é obrigatório");
        }

        if (preco < 0) {
            throw new Error("Preço não pode ser negativo");
        }

        return await this.productRepository.createProduct(nome, preco, categoria);
    }

    // Listar todos os produtos
    async getAllProducts(): Promise<Product[]> {
        return await this.productRepository.getAllProducts();
    }

    // Buscar produto por ID
    async getProductById(id: number): Promise<Product | null> {
        if (!id || id <= 0) {
            throw new Error("ID inválido");
        }

        const product = await this.productRepository.getProductById(id);
        if (!product) {
            throw new Error("Produto não encontrado");
        }

        return product;
    }

    // Buscar produtos por categoria
    async getProductsByCategory(categoria: string): Promise<Product[]> {
        if (!categoria) {
            throw new Error("Categoria é obrigatória");
        }

        return await this.productRepository.getProductsByCategory(categoria);
    }

    // Atualizar produto
    async updateProduct(
        id: number,
        nome?: string,
        preco?: number,
        categoria?: string
    ): Promise<Product> {
        if (!id || id <= 0) {
            throw new Error("ID inválido");
        }

        if (preco !== undefined && preco < 0) {
            throw new Error("Preço não pode ser negativo");
        }

        const updatedProduct = await this.productRepository.updateProduct(id, nome, preco, categoria);
        
        if (!updatedProduct) {
            throw new Error("Produto não encontrado");
        }

        return updatedProduct;
    }

    // Deletar produto
    async deleteProduct(id: number): Promise<boolean> {
        if (!id || id <= 0) {
            throw new Error("ID inválido");
        }

        const deleted = await this.productRepository.deleteProduct(id);
        
        if (!deleted) {
            throw new Error("Produto não encontrado");
        }

        return true;
    }
}

