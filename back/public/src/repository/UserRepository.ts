import { Op } from "sequelize";
import User, { UserRole } from "../models/User";

export interface UserFilters {
    name?: string;
    email?: string;
}

export interface UserListOptions {
    filters?: UserFilters;
    limit?: number;
    offset?: number;
}

export class UserRepository {
    async createUser(name: string, email: string, password: string, role: UserRole = "user") {
        const user = await User.create({
            name,
            email,
            password,
            role
        });
        return user;
    }

    async getAllUsers() {
        return await User.findAll();
    }

    async getUsersWithFiltersAndPagination(options: UserListOptions) {
        const { filters = {}, limit = 10, offset = 0 } = options;
        const where: Record<string, unknown> = {};

        if (filters.name?.trim()) {
            where.name = { [Op.like]: `%${filters.name.trim()}%` };
        }
        if (filters.email?.trim()) {
            where.email = { [Op.like]: `%${filters.email.trim()}%` };
        }

        const { count, rows } = await User.findAndCountAll({
            where: Object.keys(where).length ? where : undefined,
            limit,
            offset
        });
        return { rows, count };
    }

    async getUserById(id: number) {
        return await User.findByPk(id);
    }

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

    async getUserByEmail(email: string) {
        return await User.findOne({ where: { email } });
    }

    async deleteUser(id: number) {
        const user = await User.findByPk(id);
        if (!user) {
            return false;
        }

        await user.destroy();
        return true;
    }
}

