import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

export interface ProductAttributes {
  id: number;
  nome: string;
  preco: number;
  categoriaId: number;
  estoqueId: number;
}

export interface ProductCreationAttributes
  extends Optional<ProductAttributes, "id"> {}

export class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: number;
  public nome!: string;
  public preco!: number;
  public categoriaId!: number;
  public estoqueId!: number;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    categoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categorias",
        key: "id"
      }
    },
    estoqueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "estoques",
        key: "id"
      }
    }
  },
  {
    sequelize,
    tableName: "products",
    timestamps: false
  }
);

export default Product;

