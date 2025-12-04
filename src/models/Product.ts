import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import Categoria from "./Categoria";
import Estoque from "./Estoque";
import PedidoProduto from "./PedidoProduto";

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
        model: Categoria,
        key: "id"
      }
    },
    estoqueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Estoque,
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

Product.belongsTo(Categoria, { foreignKey: "categoriaId", as: "categoria" });
Product.belongsTo(Estoque, { foreignKey: "estoqueId", as: "estoque" });
Product.hasMany(PedidoProduto, { foreignKey: "produtoId", as: "pedidoProdutos" });

export default Product;

