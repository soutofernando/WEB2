import { UserService } from '../../services/UserService';
import { UserRepository } from '../../repository/UserRepository';
import { PedidoRepository } from '../../repository/PedidoRepository';
import User from '../../models/User';

// Mock dos repositories e utils
jest.mock('../../repository/UserRepository');
jest.mock('../../repository/PedidoRepository');
jest.mock('../../utils/auth', () => ({
  hashPassword: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
}));

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPedidoRepository: jest.Mocked<PedidoRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockPedidoRepository = new PedidoRepository() as jest.Mocked<PedidoRepository>;

    userService = new UserService();
    (userService as any).userRepository = mockUserRepository;
    (userService as any).pedidoRepository = mockPedidoRepository;
  });

  describe('createUser', () => {
    it('deve criar usuário com dados válidos', async () => {
      const userMock: User = {
        id: 1,
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'hashed_123456',
        role: 'user',
      } as User;

      mockUserRepository.getUserByEmail = jest.fn().mockResolvedValue(null);
      mockUserRepository.createUser = jest.fn().mockResolvedValue(userMock);

      const resultado = await userService.createUser('João Silva', 'joao@email.com', '123456');

      expect(resultado).toEqual(userMock);
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith('joao@email.com');
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        'João Silva',
        'joao@email.com',
        'hashed_123456',
        'user'
      );
    });

    it('deve lançar erro se nome tiver menos de 2 caracteres', async () => {
      await expect(userService.createUser('A', 'joao@email.com', '123456')).rejects.toThrow(
        'Nome deve ter pelo menos 2 caracteres'
      );
    });

    it('deve lançar erro se email for inválido', async () => {
      await expect(userService.createUser('João', 'email-invalido', '123456')).rejects.toThrow(
        'Email inválido'
      );
    });

    it('deve lançar erro se senha tiver menos de 6 caracteres', async () => {
      await expect(userService.createUser('João', 'joao@email.com', '12345')).rejects.toThrow(
        'Senha deve ter pelo menos 6 caracteres'
      );
    });

    it('deve lançar erro se email já estiver em uso', async () => {
      const userExistente: User = {
        id: 1,
        name: 'Outro Usuário',
        email: 'joao@email.com',
        password: 'hash',
        role: 'user',
      } as User;

      mockUserRepository.getUserByEmail = jest.fn().mockResolvedValue(userExistente);

      await expect(userService.createUser('João', 'joao@email.com', '123456')).rejects.toThrow(
        'Email já está em uso'
      );
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('deve retornar usuário quando encontrado', async () => {
      const userMock: User = {
        id: 1,
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'hash',
        role: 'user',
      } as User;

      mockUserRepository.getUserById = jest.fn().mockResolvedValue(userMock);

      const resultado = await userService.getUserById(1);

      expect(resultado).toEqual(userMock);
    });

    it('deve lançar erro quando usuário não encontrado', async () => {
      mockUserRepository.getUserById = jest.fn().mockResolvedValue(null);

      await expect(userService.getUserById(999)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('deleteUser', () => {
    it('deve deletar usuário quando não há pedidos', async () => {
      const userMock: User = {
        id: 1,
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'hash',
        role: 'user',
      } as User;

      mockUserRepository.getUserById = jest.fn().mockResolvedValue(userMock);
      mockPedidoRepository.getPedidosByUsuario = jest.fn().mockResolvedValue([]);
      mockUserRepository.deleteUser = jest.fn().mockResolvedValue(true);

      const resultado = await userService.deleteUser(1);

      expect(resultado).toBe(true);
      expect(mockPedidoRepository.getPedidosByUsuario).toHaveBeenCalledWith(1);
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro quando usuário possui pedidos', async () => {
      const userMock: User = {
        id: 1,
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'hash',
        role: 'user',
      } as User;

      const pedidosMock = [
        { id: 1, usuarioId: 1, valorTotal: 100 },
        { id: 2, usuarioId: 1, valorTotal: 200 },
      ];

      mockUserRepository.getUserById = jest.fn().mockResolvedValue(userMock);
      mockPedidoRepository.getPedidosByUsuario = jest.fn().mockResolvedValue(pedidosMock);

      await expect(userService.deleteUser(1)).rejects.toThrow('Usuário possui');
      expect(mockUserRepository.deleteUser).not.toHaveBeenCalled();
    });
  });
});
