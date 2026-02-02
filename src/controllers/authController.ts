import { Request, Response } from "express";
import { comparePassword, generateToken } from "../utils/auth";
import { findUserByUsername } from "../models/User";
import { UserService } from "../services/UserService";

const userService = new UserService();

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Nome, email e senha são obrigatórios" });
  }

  try {
    const user = await userService.createUser(name, email, password);
    res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err: any) {
    if (err.message?.includes("Email já está em uso")) {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: "Erro ao cadastrar usuário", error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const username = req.body.username || req.body.email;
  const { password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Email (ou nome de usuário) e senha são obrigatórios" });
  }

  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(400).json({ message: "Email ou senha inválidos" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email ou senha inválidos" });
    }

    const token = generateToken(user.id, user.email);

    res.status(200).json({ message: "Login realizado com sucesso", token });
  } catch (err) {
    res.status(500).json({ message: "Erro ao fazer login", error: err });
  }
};
