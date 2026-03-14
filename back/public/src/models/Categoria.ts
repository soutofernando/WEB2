import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

export interface CategoriaAttributes {
  id: number;
  nome: string;
  descricao?: string;
}

export interface CategoriaCreationAttributes
  extends Optional<CategoriaAttributes, "id" | "descricao"> {}

export class Categoria
  extends Model<CategoriaAttributes, CategoriaCreationAttributes>
  implements CategoriaAttributes
{
  public id!: number;
  public nome!: string;
  public descricao?: string;
}

Categoria.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "categorias",
    timestamps: false
  }
);

export default Categoria;

