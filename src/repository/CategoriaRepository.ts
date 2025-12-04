import Categoria from "../models/Categoria";

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

