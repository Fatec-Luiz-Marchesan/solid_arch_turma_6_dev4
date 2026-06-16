class UserWorkflowUseCase {
    constructor(userModel) {
      this.userModel = userModel; // Recebe o Model injetado (SOLID)
    }
  
    async execute(userId, data) {
      if (!userId) {
        throw new Error('ID do usuário é obrigatório.');
      }
  
      // Validação de formato exigida pelos requisitos estruturados
      if (data.interests && !Array.isArray(data.interests)) {
        throw new Error('O campo interesses deve ser uma lista de raças.');
      }
  
      // Atualiza o registro adicionando novos campos ao fluxo do usuário
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $set: { interests: data.interests, bio: data.bio } },
        { new: true }
      ).select('-password');
  
      if (!updatedUser) {
        throw new Error('Usuário não encontrado.');
      }
  
      return updatedUser;
    }
  }
  
  module.exports = UserWorkflowUseCase;