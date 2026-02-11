# Testando a API no Postman

Tudo que você precisa está aqui: um guia em ordem para simular admin cadastrando a loja e cliente fazendo uma compra. A base da API é **http://localhost:3000**.

---

## Antes de começar

Deixa o ambiente pronto:

1. No seu `.env`, coloque (ou confira se já estão lá):
   - `ADMIN_EMAIL=admin@loja.com`
   - `ADMIN_PASSWORD=admin123`
   - `ADMIN_NAME=Admin`

2. Rode o servidor: `npm run dev`

3. Olha no terminal: deve aparecer algo como *"Usuário admin criado com sucesso"* ou *"Usuário admin já existe"*. Se aparecer, pode abrir o Postman.

---

## Passo 1 — Entrar como admin

Você vai pegar o token que identifica o admin em todas as próximas requisições.

- **Método:** POST  
- **URL:** `http://localhost:3000/auth/login`  
- **Body:** raw → JSON  
  ```json
  {
    "email": "admin@loja.com",
    "password": "admin123"
  }
  ```

Na resposta, copia o **token** (aquele texto longo). Confere também se `user.role` veio como `"admin"`.

**Dica:** Em toda requisição que pedir "token do admin", vai no Postman em **Headers** e adiciona:
- Nome: `Authorization`  
- Valor: `Bearer SEU_TOKEN_ADMIN` (a palavra *Bearer* + um espaço + o token que você colou)

Guarda esse token num bloco de notas ou no próprio Postman; você vai usar bastante.

---

## Passo 2 — Admin: criar uma categoria

Agora você, como admin, cadastra a primeira categoria da loja.

- **Método:** POST  
- **URL:** `http://localhost:3000/api/categorias`  
- **Headers:** `Authorization: Bearer SEU_TOKEN_ADMIN`  
- **Body:** raw → JSON  
  ```json
  {
    "nome": "Eletrônicos",
    "descricao": "Celulares, notebooks e acessórios"
  }
  ```

Na resposta, anota o **id** da categoria (provavelmente 1). Se quiser, repete o passo com outra categoria (ex.: *"Roupas"*) para ter mais de uma.

---

## Passo 3 — Admin: criar estoque

Cada produto vai estar ligado a um estoque. Aqui você cria o primeiro.

- **Método:** POST  
- **URL:** `http://localhost:3000/api/estoques`  
- **Headers:** `Authorization: Bearer SEU_TOKEN_ADMIN`  
- **Body:** raw → JSON  
  ```json
  {
    "quantidade": 10,
    "quantidadeMinima": 2
  }
  ```

Anota o **id** do estoque (ex.: 1). Se for testar com dois produtos, cria outro estoque (ex.: quantidade 5, quantidadeMinima 1) e anota o id também.

---

## Passo 4 — Admin: cadastrar um produto

Produto precisa de categoria e estoque. Use os ids que você anotou nos passos 2 e 3.

- **Método:** POST  
- **URL:** `http://localhost:3000/api/products`  
- **Headers:** `Authorization: Bearer SEU_TOKEN_ADMIN`  
- **Body:** raw → JSON  
  ```json
  {
    "nome": "Notebook",
    "preco": 3500.00,
    "categoriaId": 1,
    "estoqueId": 1
  }
  ```

Troque `categoriaId` e `estoqueId` pelos ids reais que a API te devolveu. Anota o **id** do produto (ex.: 1) para o cliente comprar depois.

---

## Passo 5 — Registrar um cliente (Maria)

Agora simula um cliente se cadastrando na loja. Essa rota é pública, não precisa de token.

- **Método:** POST  
- **URL:** `http://localhost:3000/auth/register`  
- **Body:** raw → JSON  
  ```json
  {
    "name": "Maria Silva",
    "email": "maria@email.com",
    "password": "123456"
  }
  ```

Se der certo, a resposta mostra o usuário com `role: "user"`. Esse é o cliente comum.

---

## Passo 6 — Login da Maria (token do cliente)

A Maria faz login para poder comprar. Você vai usar o token dela nas próximas requisições de “cliente”.

- **Método:** POST  
- **URL:** `http://localhost:3000/auth/login`  
- **Body:** raw → JSON  
  ```json
  {
    "email": "maria@email.com",
    "password": "123456"
  }
  ```

Copia o **token** da resposta e guarda como “Token Cliente”. Daqui pra frente, quando for “ação do cliente”, use no header:  
`Authorization: Bearer TOKEN_DA_MARIA`.

---

## Passo 7 — Cliente: ver a vitrine (listar produtos)

Com o token da Maria, pede a lista de produtos. É o que um cliente veria na loja.

- **Método:** GET  
- **URL:** `http://localhost:3000/api/products`  
- **Headers:** `Authorization: Bearer TOKEN_CLIENTE`

Deve aparecer o Notebook (e outros que você criou). Vale testar também:
- `GET http://localhost:3000/api/products/1` — um produto específico  
- `GET http://localhost:3000/api/products/category/1` — produtos por categoria (troque o 1 pelo id da categoria)

---

## Passo 8 — Cliente: listar categorias

Só para ver as categorias disponíveis.

- **Método:** GET  
- **URL:** `http://localhost:3000/api/categorias`  
- **Headers:** `Authorization: Bearer TOKEN_CLIENTE`

---

## Passo 9 — Cliente: fazer a compra (criar pedido)

A Maria escolhe o que quer e fecha o pedido. O pedido fica automaticamente vinculado a ela (não precisa mandar `usuarioId`).

- **Método:** POST  
- **URL:** `http://localhost:3000/api/pedidos`  
- **Headers:** `Authorization: Bearer TOKEN_CLIENTE`  
- **Body:** raw → JSON  
  ```json
  {
    "produtos": [
      { "produtoId": 1, "quantidade": 2 }
    ]
  }
  ```

Troque `produtoId` pelo id do produto e `quantidade` por um número que exista em estoque. Se pedir mais do que tem, a API devolve erro de estoque insuficiente — aí é só diminuir a quantidade.

---

## Passo 10 — Cliente: ver “meus pedidos”

A Maria quer ver os pedidos dela.

- **Método:** GET  
- **URL:** `http://localhost:3000/api/pedidos/usuario/2`  
- **Headers:** `Authorization: Bearer TOKEN_CLIENTE`

Troque o **2** pelo **id** do usuário Maria (ele aparece na resposta do login ou do register; em geral o primeiro usuário comum é id 2 se o admin é 1).

---

## Passo 11 — Admin: ver todos os pedidos da loja

Agora volta pro token do **admin**. Só admin pode listar todos os pedidos.

- **Método:** GET  
- **URL:** `http://localhost:3000/api/pedidos`  
- **Headers:** `Authorization: Bearer TOKEN_ADMIN`

Você deve ver o pedido que a Maria acabou de fazer.

---

## Passo 12 — Admin: atualizar status do pedido

Admin pode mudar o status do pedido (ex.: de *pendente* para *em processamento*).

- **Método:** PUT  
- **URL:** `http://localhost:3000/api/pedidos/1/status`  
- **Headers:** `Authorization: Bearer TOKEN_ADMIN`  
- **Body:** raw → JSON  
  ```json
  {
    "status": "em_processamento"
  }
  ```

Troque o **1** pelo id do pedido, se for diferente. Status permitidos: `pendente`, `em_processamento`, `enviado`, `entregue`, `cancelado`.

---

## Bônus — Testar que a API realmente restringe

Vale a pena bater nas travas pra ver a API negando acesso quando não deve:

- **Cliente tentando criar produto:**  
  POST em `http://localhost:3000/api/products` com **token da Maria** e um body de produto.  
  Esperado: **403** — só admin pode criar produto.

- **Cliente tentando ver estoques:**  
  GET `http://localhost:3000/api/estoques` com token da Maria.  
  Esperado: **403** — estoque é coisa de admin.

- **Cliente tentando ver pedido de outro:**  
  GET `http://localhost:3000/api/pedidos/1` com token da Maria. Se o pedido 1 for de outro usuário, esperado: **403**.

- **Sem token:**  
  GET `http://localhost:3000/api/products` **sem** o header Authorization.  
  Esperado: **401** — não identificou quem está pedindo.

---

## Resumo rápido

| Quem      | O que pode fazer | Token        |
|-----------|------------------|--------------|
| Público   | Registrar e fazer login | Nenhum       |
| Admin     | CRUD de categorias, estoques e produtos; ver todos os pedidos; alterar status | Token do admin |
| Cliente   | Ver produtos e categorias; criar pedido; ver só os próprios pedidos | Token do cliente |

Lembrete: em toda requisição que pedir token, no Postman use o header **Authorization** com valor **Bearer** + espaço + o token.

Se algo não bater com o que você vê no Postman, confere se o servidor está rodando e se os ids (categoria, estoque, produto, usuário) são os que a API te devolveu em cada passo.
