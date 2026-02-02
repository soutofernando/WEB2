import User from "./User";
import Pedido from "./Pedido";
import PedidoProduto from "./PedidoProduto";
import Product from "./Product";
import Categoria from "./Categoria";
import Estoque from "./Estoque";

Pedido.belongsTo(User, { foreignKey: "usuarioId", as: "usuario" });
Pedido.hasMany(PedidoProduto, { foreignKey: "pedidoId", as: "itens" });

PedidoProduto.belongsTo(Pedido, { foreignKey: "pedidoId", as: "pedido" });
PedidoProduto.belongsTo(Product, { foreignKey: "produtoId", as: "produto" });

Product.belongsTo(Categoria, { foreignKey: "categoriaId", as: "categoria" });
Product.belongsTo(Estoque, { foreignKey: "estoqueId", as: "estoque" });
Product.hasMany(PedidoProduto, { foreignKey: "produtoId", as: "pedidoProdutos" });
