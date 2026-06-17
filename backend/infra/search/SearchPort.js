/**
 * SearchPort
 *
 * "Porta" de busca full-text da aplicação (mesmo padrão do
 * RealtimeNotifierPort em infra/realtime). Aqui é aonde você digita as coisas que quer buscar
 * no caso os pets que quer buscar!
 *
 * Use Cases, Controllers e Models NUNCA importam o ElasticsearchAdapter
 * diretamente. Eles dependem apenas deste contrato:
 *
 *   searchService.indexUser(doc)
 *   searchService.indexPet(doc)
 *   searchService.searchUsers(query)
 *   searchService.searchPets(query)
 *   searchService.deleteUser(id)
 *   searchService.deletePet(id)
 *   searchService.ping()
 *
 * Se amanhã trocarmos ElasticSearch por OpenSearch, Meilisearch ou até uma
 * busca MongoDB $text, só o adapter muda - o resto da aplicação não sabe.
 * (Dependency Inversion Principle)
 */

class SearchPort {
  /**
   * Indexa (cria ou atualiza) um documento de usuário.
   * @param {{ id: string, name: string, email: string, phone?: string }} doc
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async indexUser(doc) {
    throw new Error('SearchPort.indexUser() não implementado')
  }

  /**
   * Indexa (cria ou atualiza) um documento de pet.
   * @param {{ id: string, name: string, description?: string, color?: string, available?: boolean }} doc
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async indexPet(doc) {
    throw new Error('SearchPort.indexPet() não implementado')
  }

  /**
   * Busca usuários por texto livre.
   * @param {string} query
   * @returns {Promise<Array<{ id: string, name: string, email: string }>>}
   */
  // eslint-disable-next-line no-unused-vars
  async searchUsers(query) {
    throw new Error('SearchPort.searchUsers() não implementado')
  }

  /**
   * Busca pets por texto livre.
   * @param {string} query
   * @returns {Promise<Array<{ id: string, name: string, description: string, color: string }>>}
   */
  // eslint-disable-next-line no-unused-vars
  async searchPets(query) {
    throw new Error('SearchPort.searchPets() não implementado')
  }

  /**
   * Remove um documento de usuário do índice.
   * @param {string} id
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async deleteUser(id) {
    throw new Error('SearchPort.deleteUser() não implementado')
  }

  /**
   * Remove um documento de pet do índice.
   * @param {string} id
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async deletePet(id) {
    throw new Error('SearchPort.deletePet() não implementado')
  }

  /**
   * Verifica conectividade com o serviço de busca. Offline que não vai funcionar né!
   * @returns {Promise<boolean>}
   */
  async ping() {
    throw new Error('SearchPort.ping() não implementado')
  }
}

module.exports = SearchPort
