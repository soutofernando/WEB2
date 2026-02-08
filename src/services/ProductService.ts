import { ProductRepository, ProductFilters } from "../repository/ProductRepository";
import { CategoriaRepository } from "../repository/CategoriaRepository";
import { EstoqueRepository } from "../repository/EstoqueRepository";
import { PedidoRepository } from "../repository/PedidoRepository";
import Product from "../models/Product";
import { PaginationParams, PaginationResult, buildPaginationResult } from "../types/pagination";

export class ProductService {
    private productRepository: ProductRepository;
    private categoriaRepository: CategoriaRepository;
    private estoqueRepository: EstoqueRepository;
    private pedidoRepository: PedidoRepository;

    constructor() {
        this.productRepository = new ProductRepository();
        this.categoriaRepository = new CategoriaRepository();
        this.estoqueRepository = new EstoqueRepository();
        this.pedidoRepository = new PedidoRepository();
    }

    async createProduct(nome: string, preco: number, categoriaId: number, estoqueId: number): Promise<Product> {
        if (!nome || nome.trim().length < 2) {
            throw new Error("Nome do produto deve ter pelo menos 2 caracteres");
        }

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

        const produtoComMesmoEstoque = await this.productRepository.getProductByEstoqueId(estoqueId);
        if (produtoComMesmoEstoque) {
            throw new Error(`Estoque já está vinculado ao produto "${produtoComMesmoEstoque.nome}". Cada estoque deve ser vinculado a um único produto.`);
        }

        return await this.productRepository.createProduct(nome.trim(), preco, categoriaId, estoqueId);
    }

    async getAllProducts(): Promise<Product[]> {
        return await this.productRepository.getAllProducts();
    }

    async getProductsWithFiltersAndPagination(
        filters: ProductFilters,
        pagination: PaginationParams
    ): Promise<PaginationResult<Product>> {
        const { rows, count } = await this.productRepository.getProductsWithFiltersAndPagination({
            filters,
            limit: pagination.limit,
            offset: pagination.offset
        });
        return buildPaginationResult(rows as Product[], count, pagination.page, pagination.limit);
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

            const produtoComMesmoEstoque = await this.productRepository.getProductByEstoqueId(estoqueId);
            if (produtoComMesmoEstoque && produtoComMesmoEstoque.id !== id) {
                throw new Error(`Estoque já está vinculado ao produto "${produtoComMesmoEstoque.nome}". Cada estoque deve ser vinculado a um único produto.`);
            }
        }

        if (nome !== undefined && nome.trim().length < 2) {
            throw new Error("Nome do produto deve ter pelo menos 2 caracteres");
        }

        const updatedProduct = await this.productRepository.updateProduct(id, nome?.trim(), preco, categoriaId, estoqueId);
        
        if (!updatedProduct) {
            throw new Error("Produto não encontrado");
        }

        return updatedProduct;
    }

    async deleteProduct(id: number): Promise<boolean> {
        const product = await this.productRepository.getProductById(id);
        if (!product) {
            throw new Error("Produto não encontrado");
        }

        const itensEmPedidos = await this.pedidoRepository.getItensByProduto(id);
        if (itensEmPedidos.length > 0) {
            const totalPedidos = new Set(itensEmPedidos.map((i: { pedidoId: number }) => i.pedidoId)).size;
            throw new Error(`Produto está em ${itensEmPedidos.length} item(ns) de ${totalPedidos} pedido(s) e não pode ser excluído. Remova o produto dos pedidos antes de excluir.`);
        }

        const deleted = await this.productRepository.deleteProduct(id);
        if (!deleted) {
            throw new Error("Erro ao excluir o produto");
        }

        return true;
    }
}

