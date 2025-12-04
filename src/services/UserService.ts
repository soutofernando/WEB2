import { UserRepository } from "../repository/UserRepository";
import User from "../models/User";

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async createUser(name: string, email: string, password: string): Promise<User> {
        const existingUser = await this.userRepository.getUserByEmail(email);
        
        if (existingUser) {
            throw new Error("Email já está em uso");
        }

        return await this.userRepository.createUser(name, email, password);
    }

    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.getAllUsers();
    }

    async getUserById(id: number): Promise<User | null> {
        const user = await this.userRepository.getUserById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        return user;
    }

    async updateUser(
        id: number,
        name?: string,
        email?: string,
        password?: string
    ): Promise<User> {
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

    async deleteUser(id: number): Promise<boolean> {
        const deleted = await this.userRepository.deleteUser(id);
        
        if (!deleted) {
            throw new Error("Usuário não encontrado");
        }

        return true;
    }
}

