import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

// 1. Atributos que existem na tabela
export interface ProductAttributes {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
}

// 2. Atributos necessários para criar (id é auto incremento)
export interface ProductCreationAttributes
  extends Optional<ProductAttributes, "id"> {}

// 3. Classe do modelo
export class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: number;
  public nome!: string;
  public preco!: number;
  public categoria!: string;
}

// 4. Inicialização do modelo (mapeia pra tabela)
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
    categoria: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "products",
    timestamps: false
  }
);

export default Product;

