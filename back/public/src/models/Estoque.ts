import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

export interface EstoqueAttributes {
  id: number;
  quantidade: number;
  quantidadeMinima: number;
}

export interface EstoqueCreationAttributes
  extends Optional<EstoqueAttributes, "id"> {}

export class Estoque
  extends Model<EstoqueAttributes, EstoqueCreationAttributes>
  implements EstoqueAttributes
{
  public id!: number;
  public quantidade!: number;
  public quantidadeMinima!: number;
}

Estoque.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    quantidadeMinima: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  },
  {
    sequelize,
    tableName: "estoques",
    timestamps: false
  }
);

export default Estoque;

