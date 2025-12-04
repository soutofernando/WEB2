import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    createUser = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    message: "Nome, email e senha são obrigatórios"
                });
            }

            const user = await this.userService.createUser(name, email, password);
            return res.status(201).json({
                message: "Usuário criado com sucesso",
                user
            });
        } catch (error: any) {
            console.error("Erro ao criar usuário:", error);
            return res.status(500).json({
                message: error.message || "Erro ao criar o usuário"
            });
        }
    };

    getAllUsers = async (req: Request, res: Response): Promise<Response> => {
        try {
            const users = await this.userService.getAllUsers();
            return res.status(200).json({
                message: "Usuários obtidos com sucesso",
                users,
                count: users.length
            });
        } catch (error: any) {
            console.error("Erro ao obter usuários:", error);
            return res.status(500).json({
                message: error.message || "Erro ao obter os usuários"
            });
        }
    };

    getUserById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            const user = await this.userService.getUserById(id);
            return res.status(200).json({
                message: "Usuário obtido com sucesso",
                user
            });
        } catch (error: any) {
            console.error("Erro ao obter usuário:", error);
            
            if (error.message === "Usuário não encontrado") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao obter o usuário"
            });
        }
    };

    updateUser = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);
            const { name, email, password } = req.body;

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            if (!name && !email && !password) {
                return res.status(400).json({
                    message: "Pelo menos um campo deve ser fornecido para atualização"
                });
            }

            const updatedUser = await this.userService.updateUser(id, name, email, password);
            return res.status(200).json({
                message: "Usuário atualizado com sucesso",
                user: updatedUser
            });
        } catch (error: any) {
            console.error("Erro ao atualizar usuário:", error);
            
            if (error.message === "Usuário não encontrado") {
                return res.status(404).json({
                    message: error.message
                });
            }

            if (error.message.includes("Email já está em uso")) {
                return res.status(409).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao atualizar o usuário"
            });
        }
    };

    deleteUser = async (req: Request, res: Response): Promise<Response> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "ID inválido"
                });
            }

            await this.userService.deleteUser(id);
            return res.status(200).json({
                message: "Usuário deletado com sucesso"
            });
        } catch (error: any) {
            console.error("Erro ao deletar usuário:", error);
            
            if (error.message === "Usuário não encontrado") {
                return res.status(404).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: error.message || "Erro ao deletar o usuário"
            });
        }
    };
}

