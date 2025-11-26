import { User } from "../models/User";

export class UserRepository {
  
  async createUser(name: string, email: string, password: string) {
    const user = await User.create({
      name,
      email,
      password
    });
    return user;
  }

  async getAllUsers() {
    return await User.findAll();
  }
}