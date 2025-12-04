import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import PedidoProduto from "./PedidoProduto";

export interface PedidoAttributes {
  id: number;
  usuarioId: number;
  dataPedido: Date;
  status: string;
  valorTotal: number;
}

export interface PedidoCreationAttributes
  extends Optional<PedidoAttributes, "id" | "dataPedido" | "status"> {}

export class Pedido
  extends Model<PedidoAttributes, PedidoCreationAttributes>
  implements PedidoAttributes
{
  public id!: number;
  public usuarioId!: number;
  public dataPedido!: Date;
  public status!: string;
  public valorTotal!: number;
}

Pedido.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id"
      }
    },
    dataPedido: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pendente"
    },
    valorTotal: {
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
    tableName: "pedidos",
    timestamps: false
  }
);

Pedido.belongsTo(User, { foreignKey: "usuarioId", as: "usuario" });
Pedido.hasMany(PedidoProduto, { foreignKey: "pedidoId", as: "itens" });

export default Pedido;

