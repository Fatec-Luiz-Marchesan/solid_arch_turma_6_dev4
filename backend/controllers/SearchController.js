/**
 * SearchController
 *
 * Controller responsável pelos endpoints de busca full-text via Elasticsearch.
 *
 * Segue o mesmo padrão dos controllers existentes (UserController,
 * PetController): recebe req/res do Express, delega para a camada de
 * infraestrutura (searchService) e retorna JSON. (Olha o Jaisão salvando aí! Quem Domina JSON domina muita coisa!)
 *
 * O controller NÃO importa ElasticsearchAdapter diretamente - ele depende
 * da abstração SearchPort exposta pelo singleton searchService.
 * (Dependency Inversion Principle) 
 */

const { searchService } = require('../infra/search')

module.exports = class SearchController {
  /**
   * GET /search/pets?q=<texto>
   * Busca pets por nome, descrição ou cor com suporte a fuzzy matching.
   */
  static async searchPets(req, res) {
    const q = (req.query.q || '').trim()

    if (!q) {
      return res.status(422).json({ message: 'Parâmetro "q" é obrigatório.' })
    }

    try {
      const results = await searchService.searchPets(q)
      return res.status(200).json({ query: q, total: results.length, results })
    } catch (err) {
      console.error('[SearchController.searchPets]', err.message)
      return res.status(500).json({ message: 'Erro ao realizar busca de pets.' })
    }
  }

  /**
   * GET /search/users?q=<texto>
   * Busca usuários por nome ou e-mail com suporte a fuzzy matching. O fuzzy lógic para achar os usuários
   * Alguém não se lembra da aula de Estrutura de Dados?
   *
   * Nota: retorna apenas campos públicos (id, name, email) - campos
   * sensíveis como password nunca chegam ao índice ElasticSearch.
   */
  static async searchUsers(req, res) {
    const q = (req.query.q || '').trim()

    if (!q) {
      return res.status(422).json({ message: 'Parâmetro "q" é obrigatório.' })
    }

    try {
      const results = await searchService.searchUsers(q)
      return res.status(200).json({ query: q, total: results.length, results })
    } catch (err) {
      console.error('[SearchController.searchUsers]', err.message)
      return res.status(500).json({ message: 'Erro ao realizar busca de usuários.' })
    }
  }

  /**
   * GET /search/health
   * Verifica se o Elasticsearch está acessível. Útil para healthchecks
   * e para o README de PoC. Para ver se está tudo certinho!
   */
  static async health(req, res) {
    try {
      const alive = await searchService.ping()
      return res.status(alive ? 200 : 503).json({
        elasticsearch: alive ? 'ok' : 'unavailable',
      })
    } catch (err) {
      return res.status(503).json({ elasticsearch: 'error', detail: err.message })
    }
  }
}
