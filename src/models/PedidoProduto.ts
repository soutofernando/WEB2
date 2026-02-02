import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

export interface PedidoProdutoAttributes {
  id: number;
  pedidoId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface PedidoProdutoCreationAttributes
  extends Optional<PedidoProdutoAttributes, "id" | "subtotal"> {}

export class PedidoProduto
  extends Model<PedidoProdutoAttributes, PedidoProdutoCreationAttributes>
  implements PedidoProdutoAttributes
{
  public id!: number;
  public pedidoId!: number;
  public produtoId!: number;
  public quantidade!: number;
  public precoUnitario!: number;
  public subtotal!: number;
}

PedidoProduto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    pedidoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "pedidos",
        key: "id"
      }
    },
    produtoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id"
      }
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    precoUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  },
  {
    sequelize,
    tableName: "pedido_produtos",
    timestamps: false
  }
);

export default PedidoProduto;

