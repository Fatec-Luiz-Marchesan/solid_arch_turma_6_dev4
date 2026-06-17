const UserWorkflowUseCase = require('./helpers/UserWorkflowUseCase');

describe('User Workflow Use Case (Task 153)', () => {
  let mockUserModel;

  beforeEach(() => {
    mockUserModel = {
      findByIdAndUpdate: jest.fn()
    };
  });

  it('deve atualizar o fluxo de interesses do usuário com sucesso', async () => {
    const mockUser = { _id: '123', name: 'Tester', interests: ['Caramelo'], bio: 'Dev' };
    
   
    mockUserModel.findByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const useCase = new UserWorkflowUseCase(mockUserModel);
    const result = await useCase.execute('123', { interests: ['Caramelo'], bio: 'Dev' });

    expect(result.interests).toContain('Caramelo');
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  it('deve retornar erro se o formato de interesses for inválido', async () => {
    const useCase = new UserWorkflowUseCase(mockUserModel);

    await expect(
      useCase.execute('123', { interests: 'Não é um array' })
    ).rejects.toThrow('O campo interesses deve ser uma lista de raças.');
  });
});