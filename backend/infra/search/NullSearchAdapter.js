/**
 * NullSearchAdapter
 *
 * Implementação "nula" da SearchPort - todas as operações são no-op.
 *
 * Usado quando ELASTICSEARCH_ENABLED=false (ou a variável não está
 * definida). Permite rodar a aplicação sem um cluster Elasticsearch,
 * o que é útil em:
 *   - ambientes de desenvolvimento sem Docker Compose completo
 *   - testes unitários que não precisam do Elastic
 *   - CI jobs focados apenas no backend/Mongo
 *
 * Também serve como documentação viva: mostra exatamente quais métodos
 * a SearchPort exige de qualquer implementação.
 * Então antes de mexer qualquer coisa, veja isso aqui primeiro!
 */

const SearchPort = require('./SearchPort')

class NullSearchAdapter extends SearchPort {
  async init()              { /* no-op */ }
  async indexUser()         { /* no-op */ }
  async indexPet()          { /* no-op */ }
  async searchUsers()       { return []  }
  async searchPets()        { return []  }
  async deleteUser()        { /* no-op */ }
  async deletePet()         { /* no-op */ }
  async ping()              { return false }
}

module.exports = NullSearchAdapter
