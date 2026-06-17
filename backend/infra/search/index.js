/**
 * infra/search/index.js
 *
 * Ponto de entrada único para o subsistema de busca.
 * Exporta o singleton `searchService` que implementa SearchPort.
 * Afinal o sistema tem que começar de algum lugar!
 *
 * A escolha de qual adapter usar é feita pela variável de ambiente
 * ELASTICSEARCH_ENABLED. Isso mantém o Dependency Inversion Principle:
 * quem importa `searchService` (controllers, routers) não sabe se está
 * falando com Elasticsearch ou com o NullAdapter.
 *
 * Uso em index.js (aplicação principal):
 *
 *   const { searchService } = require('./infra/search')
 *   await searchService.init()       // conecta + cria índices se necessário
 *
 * Uso em controllers/routers:
 *
 *   const { searchService } = require('../infra/search')
 *   const results = await searchService.searchPets('golden')
 */

const AppConfig = require('../config')

let searchService

if (AppConfig.elasticsearchEnabled) {
  const ElasticsearchAdapter = require('./ElasticsearchAdapter')
  searchService = new ElasticsearchAdapter()
} else {
  const NullSearchAdapter = require('./NullSearchAdapter')
  searchService = new NullSearchAdapter()
  console.log('[Search] ElasticSearch desabilitado → NullSearchAdapter ativo')
}

module.exports = { searchService }
