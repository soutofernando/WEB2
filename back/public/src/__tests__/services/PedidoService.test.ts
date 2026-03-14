import { PedidoService } from '../../services/PedidoService';
import { PedidoRepository } from '../../repository/PedidoRepository';
import { ProductRepository } from '../../repository/ProductRepository';
import { UserRepository } from '../../repository/UserRepository';
import { EstoqueRepository } from '../../repository/EstoqueRepository';
import { CategoriaRepository } from '../../repository/CategoriaRepository';
import Pedido from '../../models/Pedido';

jest.mock('../../repository/PedidoRepository');
jest.mock('../../repository/ProductRepository');
jest.mock('../../repository/UserRepository');
jest.mock('../../repository/EstoqueRepository');
jest.mock('../../repository/CategoriaRepository');

describe('PedidoService', () => {
  let service: PedidoService;
  let mockPedidoRepository: jest.Mocked<PedidoRepository>;
  let mockProductRepository: jest.Mocked<ProductRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEstoqueRepository: jest.Mocked<EstoqueRepository>;
  let mockCategoriaRepository: jest.Mocked<CategoriaRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPedidoRepository = new PedidoRepository() as jest.Mocked<PedidoRepository>;
    mockProductRepository = new ProductRepository() as jest.Mocked<ProductRepository>;
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockEstoqueRepository = new EstoqueRepository() as jest.Mocked<EstoqueRepository>;
    mockCategoriaRepository = new CategoriaRepository() as jest.Mocked<CategoriaRepository>;
    service = new PedidoService();
    (service as any).pedidoRepository = mockPedidoRepository;
    (service as any).productRepository = mockProductRepository;
    (service as any).userRepository = mockUserRepository;
    (service as any).estoqueRepository = mockEstoqueRepository;
    (service as any).categoriaRepository = mockCategoriaRepository;
  });

  describe('createPedido', () => {
    it('deve criar pedido com um produto e atualizar estoque', async () => {
      const usuarioId = 1;
      const pedidoCriado: Pedido = { id: 10 } as Pedido;
      const produto = { id: 5, nome: 'Prod', preco: 20, categoriaId: 3, estoqueId: 7 };
      const categoria = { id: 3, nome: 'Cat' } as any;
      const estoque = { id: 7, quantidade: 10, save: jest.fn() } as any;
      const produtosInput = [{ produtoId: 5, quantidade: 2 }];
      const pedidoFinal: Pedido = { id: 10, usuarioId } as any;

      mockUserRepository.getUserById = jest.fn().mockResolvedValue({ id: usuarioId } as any);
      mockPedidoRepository.createPedido = jest.fn().mockResolvedValue(pedidoCriado);
      mockProductRepository.getProductById = jest.fn().mockResolvedValue(produto as any);
      mockCategoriaRepository.getCategoriaById = jest.fn().mockResolvedValue(categoria);
      mockEstoqueRepository.getEstoqueById = jest.fn().mockResolvedValue(estoque);
      mockPedidoRepository.addProdutoToPedido = jest.fn().mockResolvedValue(undefined);
      mockPedidoRepository.updatePedidoValorTotal = jest.fn().mockResolvedValue(undefined);
      mockPedidoRepository.getPedidoById = jest.fn().mockResolvedValue(pedidoFinal);

      const resultado = await service.createPedido(usuarioId, produtosInput);

      expect(resultado).toEqual(pedidoFinal);
      expect(mockPedidoRepository.createPedido).toHaveBeenCalledWith(usuarioId, undefined);
      expect(mockPedidoRepository.addProdutoToPedido).toHaveBeenCalledWith(10, 5, 2, 20);
      expect(mockPedidoRepository.updatePedidoValorTotal).toHaveBeenCalledWith(10, 40);
      expect(estoque.quantidade).toBe(8);
      expect(estoque.save).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando usuário não encontrado', async () => {
      mockUserRepository.getUserById = jest.fn().mockResolvedValue(null);
      await expect(service.createPedido(999, [{ produtoId: 1, quantidade: 1 }])).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro quando quantidade é inválida', async () => {
      mockUserRepository.getUserById = jest.fn().mockResolvedValue({ id: 1 } as any);
      await expect(service.createPedido(1, [{ produtoId: 1, quantidade: 0 }])).rejects.toThrow('Quantidade deve ser maior que zero');
    });
  });

  describe('getPedidoById', () => {
    it('deve lançar erro quando pedido não encontrado', async () => {
      mockPedidoRepository.getPedidoById = jest.fn().mockResolvedValue(null);
      await expect(service.getPedidoById(123)).rejects.toThrow('Pedido não encontrado');
    });
  });

  describe('updatePedidoStatus', () => {
    it('deve lançar erro quando status é inválido', async () => {
      await expect(service.updatePedidoStatus(1, 'invalido')).rejects.toThrow('Status inválido');
    });
  });
});
