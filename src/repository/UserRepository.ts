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
}

