import User from "../models/User";

export class UserRepository {
    // Criar um novo usuário
    async createUser(name: string, email: string, password: string) {
        const user = await User.create({
            name,
            email,
            password
        });
        return user;
    }

    // Listar todos os usuários
    async getAllUsers() {
        return await User.findAll();
    }

    // Buscar usuário por ID
    async getUserById(id: number) {
        return await User.findByPk(id);
    }

    // Atualizar usuário
    async updateUser(id: number, name?: string, email?: string, password?: string) {
        const user = await User.findByPk(id);
        if (!user) {
            return null;
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();
        return user;
    }

    // Buscar usuário por email
    async getUserByEmail(email: string) {
        return await User.findOne({ where: { email } });
    }

    // Deletar usuário
    async deleteUser(id: number) {
        const user = await User.findByPk(id);
        if (!user) {
            return false;
        }

        await user.destroy();
        return true;
    }
}

