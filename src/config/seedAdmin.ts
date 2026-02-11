import { UserRepository } from "../repository/UserRepository";
import { hashPassword } from "../utils/auth";

export async function seedAdminUser(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Administrador";

  if (!email || !password) {
    console.log("ADMIN_EMAIL e ADMIN_PASSWORD não definidos. Nenhum admin criado. Defina no .env para criar um usuário admin.");
    return;
  }

  const userRepository = new UserRepository();
  const existing = await userRepository.getUserByEmail(email.trim().toLowerCase());
  if (existing) {
    if (existing.role === "admin") {
      console.log("Usuário admin já existe:", email);
    } else {
      console.log("Já existe um usuário com este email (não é admin):", email);
    }
    return;
  }

  const hashedPassword = await hashPassword(password);
  const admin = await userRepository.createUser(
    name,
    email.trim().toLowerCase(),
    hashedPassword,
    "admin"
  );
  console.log("Usuário admin criado com sucesso. Email:", admin.email);
}
