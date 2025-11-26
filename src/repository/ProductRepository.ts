import Product from "../models/Product";

export class ProductRepository {
    // Criar um novo produto
    async createProduct(nome: string, preco: number, categoria: string) {
        const product = await Product.create({
            nome,
            preco,
            categoria
        });
        return product;
    }

    // Listar todos os produtos
    async getAllProducts() {
        return await Product.findAll();
    }

    // Buscar produto por ID
    async getProductById(id: number) {
        return await Product.findByPk(id);
    }

    // Buscar produtos por categoria
    async getProductsByCategory(categoria: string) {
        return await Product.findAll({ where: { categoria } });
    }

    // Atualizar produto
    async updateProduct(id: number, nome?: string, preco?: number, categoria?: string) {
        const product = await Product.findByPk(id);
        if (!product) {
            return null;
        }

        if (nome) product.nome = nome;
        if (preco !== undefined) product.preco = preco;
        if (categoria) product.categoria = categoria;

        await product.save();
        return product;
    }

    // Deletar produto
    async deleteProduct(id: number) {
        const product = await Product.findByPk(id);
        if (!product) {
            return false;
        }

        await product.destroy();
        return true;
    }
}

