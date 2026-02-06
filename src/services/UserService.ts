import { UserRepository } from "../repository/UserRepository";
import { PedidoRepository } from "../repository/PedidoRepository";
import User from "../models/User";
import { hashPassword } from "../utils/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN_LENGTH = 6;

export class UserService {
    private userRepository: UserRepository;
    private pedidoRepository: PedidoRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.pedidoRepository = new PedidoRepository();
    }

    async createUser(name: string, email: string, password: string): Promise<User> {
        if (!name || name.trim().length < 2) {
            throw new Error("Nome deve ter pelo menos 2 caracteres");
        }

        if (!EMAIL_REGEX.test(email)) {
            throw new Error("Email inválido");
        }

        if (!password || password.length < SENHA_MIN_LENGTH) {
            throw new Error(`Senha deve ter pelo menos ${SENHA_MIN_LENGTH} caracteres`);
        }

        const existingUser = await this.userRepository.getUserByEmail(email);
        
        if (existingUser) {
            throw new Error("Email já está em uso");
        }

        const hashedPassword = await hashPassword(password);
        return await this.userRepository.createUser(name, email.trim().toLowerCase(), hashedPassword);
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

    async getUserComResumoPedidos(id: number): Promise<{
        user: User;
        pedidosCount: number;
        ultimoPedido: { id: number; dataPedido: Date; status: string; valorTotal: number } | null;
    }> {
        const user = await this.userRepository.getUserById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const pedidos = await this.pedidoRepository.getPedidosByUsuario(id);
        const ordenadosPorData = [...pedidos].sort(
            (a, b) => new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime()
        );
        const ultimoPedido = ordenadosPorData.length > 0
            ? (() => {
                const p = ordenadosPorData[0];
                return { id: p.id, dataPedido: p.dataPedido, status: p.status, valorTotal: Number(p.valorTotal) };
            })()
            : null;

        return { user, pedidosCount: pedidos.length, ultimoPedido };
    }

    async updateUser(
        id: number,
        name?: string,
        email?: string,
        password?: string
    ): Promise<User> {
        if (name !== undefined && name.trim().length < 2) {
            throw new Error("Nome deve ter pelo menos 2 caracteres");
        }

        if (email !== undefined && !EMAIL_REGEX.test(email)) {
            throw new Error("Email inválido");
        }

        if (password !== undefined && password.length < SENHA_MIN_LENGTH) {
            throw new Error(`Senha deve ter pelo menos ${SENHA_MIN_LENGTH} caracteres`);
        }

        if (email) {
            const existingUser = await this.userRepository.getUserByEmail(email.trim().toLowerCase());
            
            if (existingUser && existingUser.id !== id) {
                throw new Error("Email já está em uso por outro usuário");
            }
        }

        const hashedPassword = password ? await hashPassword(password) : undefined;
        const emailNormalizado = email ? email.trim().toLowerCase() : undefined;
        const updatedUser = await this.userRepository.updateUser(id, name, emailNormalizado, hashedPassword);
        
        if (!updatedUser) {
            throw new Error("Usuário não encontrado");
        }

        return updatedUser;
    }

    async deleteUser(id: number): Promise<boolean> {
        const user = await this.userRepository.getUserById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const pedidos = await this.pedidoRepository.getPedidosByUsuario(id);
        if (pedidos.length > 0) {
            throw new Error(`Usuário possui ${pedidos.length} pedido(s) e não pode ser excluído. Cancele ou remova os pedidos antes de excluir o usuário.`);
        }

        const deleted = await this.userRepository.deleteUser(id);
        if (!deleted) {
            throw new Error("Erro ao excluir o usuário");
        }

        return true;
    }
}

