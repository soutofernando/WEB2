import User from "../models/User";

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

