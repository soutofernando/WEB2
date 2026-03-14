import { CategoriaService } from '../../services/CategoriaService';
import { CategoriaRepository } from '../../repository/CategoriaRepository';
import { ProductRepository } from '../../repository/ProductRepository';
import Categoria from '../../models/Categoria';

jest.mock('../../repository/CategoriaRepository');
jest.mock('../../repository/ProductRepository');

describe('CategoriaService', () => {
  let service: CategoriaService;
  let mockCategoriaRepository: jest.Mocked<CategoriaRepository>;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoriaRepository = new CategoriaRepository() as jest.Mocked<CategoriaRepository>;
    mockProductRepository = new ProductRepository() as jest.Mocked<ProductRepository>;
    service = new CategoriaService();
    (service as any).categoriaRepository = mockCategoriaRepository;
    (service as any).productRepository = mockProductRepository;
  });

  describe('createCategoria', () => {
    it('deve criar categoria quando nome é único', async () => {
      const categoriaMock: Categoria = { id: 1, nome: 'Eletrônicos', descricao: 'Desc' } as Categoria;
      mockCategoriaRepository.getCategoriaByNome = jest.fn().mockResolvedValue(null);
      mockCategoriaRepository.createCategoria = jest.fn().mockResolvedValue(categoriaMock);

      const resultado = await service.createCategoria('Eletrônicos', 'Desc');

      expect(resultado).toEqual(categoriaMock);
      expect(mockCategoriaRepository.getCategoriaByNome).toHaveBeenCalledWith('Eletrônicos');
      expect(mockCategoriaRepository.createCategoria).toHaveBeenCalledWith('Eletrônicos', 'Desc');
    });

    it('deve lançar erro quando nome já existe', async () => {
      const existente: Categoria = { id: 2, nome: 'Eletrônicos' } as Categoria;
      mockCategoriaRepository.getCategoriaByNome = jest.fn().mockResolvedValue(existente);

      await expect(service.createCategoria('Eletrônicos', 'Desc')).rejects.toThrow(
        'Categoria com este nome já existe'
      );
      expect(mockCategoriaRepository.createCategoria).not.toHaveBeenCalled();
    });
  });

  describe('getAllCategorias', () => {
    it('deve retornar todas as categorias', async () => {
      const lista: Categoria[] = [
        { id: 1, nome: 'A' } as Categoria,
        { id: 2, nome: 'B' } as Categoria,
      ];
      mockCategoriaRepository.getAllCategorias = jest.fn().mockResolvedValue(lista);

      const resultado = await service.getAllCategorias();

      expect(resultado).toEqual(lista);
      expect(mockCategoriaRepository.getAllCategorias).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCategoriasWithFiltersAndPagination', () => {
    it('deve retornar estrutura de paginação correta', async () => {
      const rows: Categoria[] = [{ id: 1, nome: 'A' } as Categoria];
      mockCategoriaRepository.getCategoriasWithFiltersAndPagination = jest
        .fn()
        .mockResolvedValue({ rows, count: 2 });

      const resultado = await service.getCategoriasWithFiltersAndPagination(
        { nome: 'A' },
        { page: 2, limit: 1, offset: 1 }
      );

      expect(resultado.data).toEqual(rows);
      expect(resultado.totalItems).toBe(2);
      expect(resultado.currentPage).toBe(2);
      expect(resultado.totalPages).toBe(2);
      expect(mockCategoriaRepository.getCategoriasWithFiltersAndPagination).toHaveBeenCalledWith({
        filters: { nome: 'A' },
        limit: 1,
        offset: 1,
      });
    });
  });

  describe('getCategoriaById', () => {
    it('deve retornar categoria quando encontrada', async () => {
      const categoria: Categoria = { id: 1, nome: 'A' } as Categoria;
      mockCategoriaRepository.getCategoriaById = jest.fn().mockResolvedValue(categoria);

      const resultado = await service.getCategoriaById(1);

      expect(resultado).toEqual(categoria);
      expect(mockCategoriaRepository.getCategoriaById).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro quando não encontrada', async () => {
      mockCategoriaRepository.getCategoriaById = jest.fn().mockResolvedValue(null);

      await expect(service.getCategoriaById(999)).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('getCategoriaComProdutos', () => {
    it('deve retornar categoria e seus produtos', async () => {
      const categoria: Categoria = { id: 1, nome: 'A' } as Categoria;
      const produtos = [{ id: 10, nome: 'P1' }, { id: 11, nome: 'P2' }];
      mockCategoriaRepository.getCategoriaById = jest.fn().mockResolvedValue(categoria);
      mockProductRepository.getProductsByCategory = jest.fn().mockResolvedValue(produtos);

      const resultado = await service.getCategoriaComProdutos(1);

      expect(resultado.categoria).toEqual(categoria);
      expect(resultado.produtos).toEqual(produtos);
      expect(resultado.totalProdutos).toBe(produtos.length);
      expect(mockProductRepository.getProductsByCategory).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro quando categoria não encontrada', async () => {
      mockCategoriaRepository.getCategoriaById = jest.fn().mockResolvedValue(null);

      await expect(service.getCategoriaComProdutos(1)).rejects.toThrow('Categoria não encontrada');
      expect(mockProductRepository.getProductsByCategory).not.toHaveBeenCalled();
    });
  });

  describe('updateCategoria', () => {
    it('deve lançar erro se nome já pertence a outra categoria', async () => {
      const existente: Categoria = { id: 2, nome: 'Eletrônicos' } as Categoria;
      mockCategoriaRepository.getCategoriaByNome = jest.fn().mockResolvedValue(existente);

      await expect(service.updateCategoria(1, 'Eletrônicos', 'Desc')).rejects.toThrow(
        'Categoria com este nome já existe'
      );
      expect(mockCategoriaRepository.updateCategoria).not.toHaveBeenCalled();
    });

    it('deve permitir atualizar quando nome pertence à mesma categoria', async () => {
      const existente: Categoria = { id: 1, nome: 'Eletrônicos' } as Categoria;
      const atualizado: Categoria = { id: 1, nome: 'Eletrônicos', descricao: 'Nova' } as Categoria;
      mockCategoriaRepository.getCategoriaByNome = jest.fn().mockResolvedValue(existente);
      mockCategoriaRepository.updateCategoria = jest.fn().mockResolvedValue(atualizado);

      const resultado = await service.updateCategoria(1, 'Eletrônicos', 'Nova');

      expect(resultado).toEqual(atualizado);
      expect(mockCategoriaRepository.updateCategoria).toHaveBeenCalledWith(1, 'Eletrônicos', 'Nova');
    });

    it('deve lançar erro quando categoria não encontrada ao atualizar', async () => {
      mockCategoriaRepository.getCategoriaByNome = jest.fn().mockResolvedValue(null);
      mockCategoriaRepository.updateCategoria = jest.fn().mockResolvedValue(null);

      await expect(service.updateCategoria(1, 'X', 'Y')).rejects.toThrow('Categoria não encontrada');
    });
  });

  describe('deleteCategoria', () => {
    it('deve lançar erro quando categoria não encontrada', async () => {
      mockCategoriaRepository.getCategoriaById = jest.fn().mockResolvedValue(null);

      await expect(service.deleteCategoria(1)).rejects.toThrow('Categoria não encontrada');
      expect(mockProductRepository.getProductsByCategory).not.toHaveBeenCalled();
      expect(mockCategoriaRepository.deleteCategoria).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando há produtos vinculados', async () => {
      const categoria: Categoria = { id: 1, nome: 'A' } as Categoria;
      const produtos = [{ nome: 'P1' }, { nome: 'P2' }];
      mockCategoriaRepository.getCategoriaById = jest.fn().mockResolvedValue(categoria);
      mockProductRepository.getProductsByCategory = jest.fn().mockResolvedValue(produtos);

      await expect(service.deleteCategoria(1)).rejects.toThrow('Categoria está em uso');
      expect(mockCategoriaRepository.deleteCategoria).not.toHaveBeenCalled();
    });

    it('deve excluir quando não há produtos vinculados', async () => {
      const categoria: Categoria = { id: 1, nome: 'A' } as Categoria;
      mockCategoriaRepository.getCategoriaById = jest.fn().mockResolvedValue(categoria);
      mockProductRepository.getProductsByCategory = jest.fn().mockResolvedValue([]);
      mockCategoriaRepository.deleteCategoria = jest.fn().mockResolvedValue(true);

      const resultado = await service.deleteCategoria(1);

      expect(resultado).toBe(true);
      expect(mockProductRepository.getProductsByCategory).toHaveBeenCalledWith(1);
      expect(mockCategoriaRepository.deleteCategoria).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro quando exclusão falha', async () => {
      const categoria: Categoria = { id: 1, nome: 'A' } as Categoria;
      mockCategoriaRepository.getCategoriaById = jest.fn().mockResolvedValue(categoria);
      mockProductRepository.getProductsByCategory = jest.fn().mockResolvedValue([]);
      mockCategoriaRepository.deleteCategoria = jest.fn().mockResolvedValue(false);

      await expect(service.deleteCategoria(1)).rejects.toThrow('Erro ao excluir a categoria');
    });
  });
});
