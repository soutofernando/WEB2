import { UserRepository } from "../repository/UserRepository";
import User from "../models/User";

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    // Criar um novo usuário
    async createUser(name: string, email: string, password: string): Promise<User> {
        // Validações básicas
        if (!name || !email || !password) {
            throw new Error("Nome, email e senha são obrigatórios");
        }

        // Verificar se o email já existe
        const existingUser = await this.userRepository.getUserByEmail(email);
        
        if (existingUser) {
            throw new Error("Email já está em uso");
        }

        return await this.userRepository.createUser(name, email, password);
    }

    // Listar todos os usuários
    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.getAllUsers();
    }

    // Buscar usuário por ID
    async getUserById(id: number): Promise<User | null> {
        if (!id || id <= 0) {
            throw new Error("ID inválido");
        }

        const user = await this.userRepository.getUserById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        return user;
    }

    // Atualizar usuário
    async updateUser(
        id: number,
        name?: string,
        email?: string,
        password?: string
    ): Promise<User> {
        if (!id || id <= 0) {
            throw new Error("ID inválido");
        }

        // Verificar se o email já está em uso por outro usuário
        if (email) {
            const existingUser = await this.userRepository.getUserByEmail(email);
            
            if (existingUser && existingUser.id !== id) {
                throw new Error("Email já está em uso por outro usuário");
            }
        }

        const updatedUser = await this.userRepository.updateUser(id, name, email, password);
        
        if (!updatedUser) {
            throw new Error("Usuário não encontrado");
        }

        return updatedUser;
    }

    // Deletar usuário
    async deleteUser(id: number): Promise<boolean> {
        if (!id || id <= 0) {
            throw new Error("ID inválido");
        }

        const deleted = await this.userRepository.deleteUser(id);
        
        if (!deleted) {
            throw new Error("Usuário não encontrado");
        }

        return true;
    }
}

