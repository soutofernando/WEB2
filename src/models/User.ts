import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

export type UserRole = "user" | "admin";

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "role"> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user"
    }
  },
  {
    sequelize,
    tableName: "users",
    timestamps: false
  }
);

export const findUserByUsername = async (username: string) => {
  return await User.findOne({ where: { email: username } });
};

export default User;

