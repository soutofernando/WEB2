# 🧪 Documentação de Testes de Unidade

Este documento centraliza as regras de negócio e os cenários de teste implementados para os serviços core da aplicação, utilizando **Jest** e **TypeScript**.

## Arquitetura de Testes
Os testes seguem o padrão de isolamento total, utilizando mocks para repositórios e serviços externos.
- **Isolamento:** Nenhuma chamada real ao banco de dados ou funções de hash.
- **Padrão:** AAA (Arrange, Act, Assert).
- **Mocks:** Injeção de dependência manual nos serviços para controle total do estado.

---

## 1. UserService
Focado em segurança, validação de dados de entrada e integridade do usuário.

### Regras de Negócio Testadas:
* **Criação de Usuário:**
    * Validação de tamanho de nome (min. 2 caracteres).
    * Validação de formato de e-mail e unicidade (e-mail já em uso).
    * Segurança: Verificação se a senha passa pelo processo de hash antes de ser salva.
* **Gestão e Deleção:**
    * **Integridade Referencial:** Bloqueio de exclusão de usuários que possuem pedidos vinculados.
    * Tratamento de erro para usuários inexistentes.

---

## 2. EstoqueService
Focado em lógica de inventário e regras de consistência numérica.

### Regras de Negócio Testadas:
* **Gestão de Quantidades:**
    * Bloqueio de valores negativos para estoque e estoque mínimo.
    * **Regra de Consistência:** A quantidade mínima não pode ultrapassar a quantidade total em estoque.
* **Gestão e Deleção:**
    * **Integridade Referencial:** Bloqueio de exclusão de estoques que possuem produtos associados.
    * Garantia de que atualizações de estoque também respeitem as regras de consistência.

---

## Instalação das dependências e Comandos de Execução

execute no terminal:

```bash
npm install --save-dev jest @types/jest ts-jest
```

Rodar todos os testes:
```bash
npm test