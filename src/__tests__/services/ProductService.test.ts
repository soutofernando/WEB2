import { ProductService } from '../../services/ProductService';
import { ProductRepository } from '../../repository/ProductRepository';
import { CategoriaRepository } from '../../repository/CategoriaRepository';
import { EstoqueRepository } from '../../repository/EstoqueRepository';
import { PedidoRepository } from '../../repository/PedidoRepository';
import Product from '../../models/Product';

jest.mock('../../repository/ProductRepository');
jest.mock('../../repository/CategoriaRepository');
jest.mock('../../repository/EstoqueRepository');
jest.mock('../../repository/PedidoRepository');

describe('ProductService', () => {
  let service: ProductService;
  let mockProductRepository: jest.Mocked<ProductRepository>;
  let mockCategoriaRepository: jest.Mocked<CategoriaRepository>;
  let mockEstoqueRepository: jest.Mocked<EstoqueRepository>;
  let mockPedidoRepository: jest.Mocked<PedidoRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProductRepository = new ProductRepository() as jest.Mocked<ProductRepository>;
    mockCategoriaRepository = new CategoriaRepository() as jest.Mocked<CategoriaRepository>;
    mockEstoqueRepository = new EstoqueRepository() as jest.Mocked<EstoqueRepository>;
    mockPedidoRepository = new PedidoRepository() as jest.Mocked<PedidoRepository>;
    service = new ProductService();
    (service as any).productRepository = mockProductRepository;
    (service as any).categoriaRepository = mockCategoriaRepository;
    (service as any).estoqueRepository = mockEstoqueRepository;
    (service as any).pedidoRepository = mockPedidoRepository;
  });

  describe('createProduct', () => {
    it('deve criar produto válido e verificar vínculos', async () => {
      const produtoCriado: Product = { id: 1, nome: 'TV', preco: 1000, categoriaId: 2, estoqueId: 3 } as any;
      mockCategoriaRepository.getCategoriaById = jest.fn().mockResolvedValue({ id: 2 } as any);
      mockEstoqueRepository.getEstoqueById = jest.fn().mockResolvedValue({ id: 3 } as any);
      mockProductRepository.getProductByEstoqueId = jest.fn().mockResolvedValue(null);
      mockProductRepository.createProduct = jest.fn().mockResolvedValue(produtoCriado);

      const resultado = await service.createProduct(' TV ', 1000, 2, 3);

      expect(resultado).toEqual(produtoCriado);
      expect(mockCategoriaRepository.getCategoriaById).toHaveBeenCalledWith(2);
      expect(mockEstoqueRepository.getEstoqueById).toHaveBeenCalledWith(3);
      expect(mockProductRepository.getProductByEstoqueId).toHaveBeenCalledWith(3);
      expect(mockProductRepository.createProduct).toHaveBeenCalledWith('TV', 1000, 2, 3);
    });

    it('deve lançar erro quando categoria não encontrada', async () => {
      mockCategoriaRepository.getCategoriaById = jest.fn().mockResolvedValue(null);
      await expect(service.createProduct('AB', 10, 999, 1)).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('getProductById', () => {
    it('deve lançar erro quando produto não encontrado', async () => {
      mockProductRepository.getProductById = jest.fn().mockResolvedValue(null);
      await expect(service.getProductById(123)).rejects.toThrow('Produto não encontrado');
    });
  });

  describe('getProductsByCategory', () => {
    it('deve lançar erro quando categoria não encontrada', async () => {
      mockCategoriaRepository.getCategoriaById = jest.fn().mockResolvedValue(null);
      await expect(service.getProductsByCategory(999)).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('getProductsWithFiltersAndPagination', () => {
    it('deve retornar dados paginados corretamente', async () => {
      const rows: Product[] = [{ id: 1, nome: 'TV' } as any];
      mockProductRepository.getProductsWithFiltersAndPagination = jest
        .fn()
        .mockResolvedValue({ rows, count: 2 });

      const resultado = await service.getProductsWithFiltersAndPagination(
        { nome: 'TV' },
        { page: 2, limit: 1, offset: 1 }
      );

      expect(resultado.data).toEqual(rows);
      expect(resultado.totalItems).toBe(2);
      expect(resultado.currentPage).toBe(2);
      expect(resultado.totalPages).toBe(2);
      expect(mockProductRepository.getProductsWithFiltersAndPagination).toHaveBeenCalledWith({
        filters: { nome: 'TV' },
        limit: 1,
        offset: 1,
      });
    });
  });
});
