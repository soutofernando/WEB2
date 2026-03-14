import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/auth";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acesso negado. Nenhum token fornecido." });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Token inválido." });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Acesso negado. Faça login." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acesso restrito a administradores." });
  }
  next();
};

export const selfOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Acesso negado. Faça login." });
  }
  const idParam = parseInt(req.params.id, 10);
  if (req.user.role === "admin" || req.user.id === idParam) {
    return next();
  }
  return res.status(403).json({ message: "Acesso negado. Você só pode acessar seus próprios dados." });
};
