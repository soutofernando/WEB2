import { EstoqueService } from '../../services/EstoqueService';
import { EstoqueRepository } from '../../repository/EstoqueRepository';
import { ProductRepository } from '../../repository/ProductRepository';
import Estoque from '../../models/Estoque';


jest.mock('../../repository/EstoqueRepository');
jest.mock('../../repository/ProductRepository');

describe('EstoqueService', () => {
  let estoqueService: EstoqueService;
  let mockEstoqueRepository: jest.Mocked<EstoqueRepository>;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    // instâncias mockadas
    mockEstoqueRepository = new EstoqueRepository() as jest.Mocked<EstoqueRepository>;
    mockProductRepository = new ProductRepository() as jest.Mocked<ProductRepository>;

    // service com repositories mockados
    estoqueService = new EstoqueService();
    (estoqueService as any).estoqueRepository = mockEstoqueRepository;
    (estoqueService as any).productRepository = mockProductRepository;
  });

  describe('createEstoque', () => {
    it('deve criar estoque com valores válidos', async () => {
      const estoqueMock: Estoque = {
        id: 1,
        quantidade: 100,
        quantidadeMinima: 10,
      } as Estoque;

      mockEstoqueRepository.createEstoque = jest.fn().mockResolvedValue(estoqueMock);

      const resultado = await estoqueService.createEstoque(100, 10);

      expect(resultado).toEqual(estoqueMock);
      expect(mockEstoqueRepository.createEstoque).toHaveBeenCalledWith(100, 10);
      expect(mockEstoqueRepository.createEstoque).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro se quantidade for negativa', async () => {
      await expect(estoqueService.createEstoque(-10, 5)).rejects.toThrow(
        'Quantidade não pode ser negativa'
      );
      expect(mockEstoqueRepository.createEstoque).not.toHaveBeenCalled();
    });

    it('deve lançar erro se quantidadeMinima for negativa', async () => {
      await expect(estoqueService.createEstoque(100, -5)).rejects.toThrow(
        'Quantidade mínima não pode ser negativa'
      );
      expect(mockEstoqueRepository.createEstoque).not.toHaveBeenCalled();
    });

    it('deve lançar erro se quantidadeMinima for maior que quantidade', async () => {
      await expect(estoqueService.createEstoque(10, 20)).rejects.toThrow(
        'Quantidade mínima não pode ser maior que a quantidade em estoque'
      );
      expect(mockEstoqueRepository.createEstoque).not.toHaveBeenCalled();
    });
  });

  describe('getEstoqueById', () => {
    it('deve retornar estoque quando encontrado', async () => {
      const estoqueMock: Estoque = {
        id: 1,
        quantidade: 100,
        quantidadeMinima: 10,
      } as Estoque;

      mockEstoqueRepository.getEstoqueById = jest.fn().mockResolvedValue(estoqueMock);

      const resultado = await estoqueService.getEstoqueById(1);

      expect(resultado).toEqual(estoqueMock);
      expect(mockEstoqueRepository.getEstoqueById).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro quando estoque não encontrado', async () => {
      mockEstoqueRepository.getEstoqueById = jest.fn().mockResolvedValue(null);

      await expect(estoqueService.getEstoqueById(999)).rejects.toThrow(
        'Estoque não encontrado'
      );
    });
  });

  describe('updateEstoque', () => {
    it('deve atualizar estoque com valores válidos', async () => {
      const estoqueAtual: Estoque = {
        id: 1,
        quantidade: 100,
        quantidadeMinima: 10,
      } as Estoque;

      const estoqueAtualizado: Estoque = {
        id: 1,
        quantidade: 150,
        quantidadeMinima: 15,
      } as Estoque;

      mockEstoqueRepository.getEstoqueById = jest.fn().mockResolvedValue(estoqueAtual);
      mockEstoqueRepository.updateEstoque = jest.fn().mockResolvedValue(estoqueAtualizado);

      const resultado = await estoqueService.updateEstoque(1, 150, 15);

      expect(resultado).toEqual(estoqueAtualizado);
      expect(mockEstoqueRepository.updateEstoque).toHaveBeenCalledWith(1, 150, 15);
    });

    it('deve lançar erro se quantidadeMinima for maior que quantidade', async () => {
      const estoqueAtual: Estoque = {
        id: 1,
        quantidade: 100,
        quantidadeMinima: 10,
      } as Estoque;

      mockEstoqueRepository.getEstoqueById = jest.fn().mockResolvedValue(estoqueAtual);

      await expect(estoqueService.updateEstoque(1, 50, 100)).rejects.toThrow(
        'Quantidade mínima não pode ser maior que a quantidade em estoque'
      );
    });
  });

  describe('deleteEstoque', () => {
    it('deve deletar estoque quando não há produtos vinculados', async () => {
      const estoqueMock: Estoque = {
        id: 1,
        quantidade: 100,
        quantidadeMinima: 10,
      } as Estoque;

      mockEstoqueRepository.getEstoqueById = jest.fn().mockResolvedValue(estoqueMock);
      mockProductRepository.getProductsByEstoqueId = jest.fn().mockResolvedValue([]);
      mockEstoqueRepository.deleteEstoque = jest.fn().mockResolvedValue(true);

      const resultado = await estoqueService.deleteEstoque(1);

      expect(resultado).toBe(true);
      expect(mockProductRepository.getProductsByEstoqueId).toHaveBeenCalledWith(1);
      expect(mockEstoqueRepository.deleteEstoque).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro quando estoque está em uso por produtos', async () => {
      const estoqueMock: Estoque = {
        id: 1,
        quantidade: 100,
        quantidadeMinima: 10,
      } as Estoque;

      const produtosMock = [
        { id: 1, nome: 'Produto 1' },
        { id: 2, nome: 'Produto 2' },
      ];

      mockEstoqueRepository.getEstoqueById = jest.fn().mockResolvedValue(estoqueMock);
      mockProductRepository.getProductsByEstoqueId = jest.fn().mockResolvedValue(produtosMock);

      await expect(estoqueService.deleteEstoque(1)).rejects.toThrow(
        'Estoque está em uso'
      );
      expect(mockEstoqueRepository.deleteEstoque).not.toHaveBeenCalled();
    });
  });
});
