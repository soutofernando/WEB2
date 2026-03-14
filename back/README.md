# Lojinha UFCG

API base: **http://localhost:3000**

---

## Autenticação (`/auth`) — públicas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cadastra novo usuário (cliente). |
| POST | `/auth/login` | Login e retorno do token. |

---

## Produtos (`/api/products`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/products` | Lista todos os produtos. |
| GET | `/api/products/category/:categoriaId` | Lista produtos de uma categoria. |
| GET | `/api/products/:id` | Busca um produto por ID. |
| POST | `/api/products` | Cria produto *(admin)*. |
| PUT | `/api/products/:id` | Atualiza produto *(admin)*. |
| DELETE | `/api/products/:id` | Remove produto *(admin)*. |

---

## Categorias (`/api/categorias`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/categorias` | Lista todas as categorias. |
| GET | `/api/categorias/:id` | Busca categoria por ID. |
| GET | `/api/categorias/:id/produtos` | Lista produtos da categoria. |
| POST | `/api/categorias` | Cria categoria *(admin)*. |
| PUT | `/api/categorias/:id` | Atualiza categoria *(admin)*. |
| DELETE | `/api/categorias/:id` | Remove categoria *(admin)*. |

---

## Estoques (`/api/estoques`) — admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/estoques` | Lista todos os estoques. |
| GET | `/api/estoques/:id` | Busca estoque por ID. |
| GET | `/api/estoques/:id/produtos` | Lista produtos do estoque. |
| POST | `/api/estoques` | Cria estoque. |
| PUT | `/api/estoques/:id` | Atualiza estoque. |
| DELETE | `/api/estoques/:id` | Remove estoque. |

---

## Pedidos (`/api/pedidos`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/pedidos` | Cliente cria pedido (body: `produtos: [{ produtoId, quantidade }]`). |
| GET | `/api/pedidos` | Lista todos os pedidos *(admin)*. |
| GET | `/api/pedidos/usuario/:usuarioId` | Lista pedidos de um usuário. |
| GET | `/api/pedidos/:id` | Busca pedido por ID. |
| PUT | `/api/pedidos/:id/status` | Atualiza status do pedido *(admin)*. |
| DELETE | `/api/pedidos/:id` | Remove pedido *(admin)*. |

---

## Usuários (`/api/users`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/users` | Lista usuários *(admin)*. |
| GET | `/api/users/:id` | Busca usuário por ID (próprio ou admin). |
| GET | `/api/users/:id/resumo-pedidos` | Resumo de pedidos do usuário (próprio ou admin). |
| POST | `/api/users` | Cria usuário *(admin)*. |
| PUT | `/api/users/:id` | Atualiza usuário (próprio ou admin). |
| DELETE | `/api/users/:id` | Remove usuário *(admin)*. |

---

**Rotas em `/api/*` exigem header:** `Authorization: Bearer <token>`.  
Guia completo de testes no Postman: ver `POSTMAN_PASSO_A_PASSO.md`.
