/**
 * ElasticsearchAdapter
 *
 * Implementação concreta da SearchPort usando o cliente oficial
 * @elastic/elasticsearch. Esta é a única classe de toda a aplicação que
 * "sabe" que existe um cluster Elasticsearch.
 *
 * Integrada como plugin externo (igual ao SocketIOAdapter em
 * infra/realtime). Controllers e Use Cases recebem apenas a instância
 * exportada por infra/search/index.js, nunca este arquivo.
 *
 * Índices gerenciados:
 *   - getapet_users  → name, email, phone
 *   - getapet_pets   → name, description, color, available
 * 
 * Este é um adaptador ou você se esqueceu da aula de Engenharia de Software 2 no semestre passado
 * este é uma das soluções usadas!
 */

const { Client } = require('@elastic/elasticsearch')
const SearchPort = require('./SearchPort')
const AppConfig = require('../config')

class ElasticsearchAdapter extends SearchPort {
  constructor() {
    super()
    this._client = null
    this._ready = false
  }

  /**
   * Inicializa o cliente e garante que os índices existam.
   * Chamado uma vez em infra/search/index.js na subida da aplicação.
   */
  async init() {
    this._client = new Client({
      node: AppConfig.elasticsearchUrl,
      // Desabilita verificação TLS em desenvolvimento (Elastic single-node).
      // Em produção, remova esta opção e configure certificados adequados.
      tls: { rejectUnauthorized: false },
    })

    await this._ensureIndex('getapet_users', {
      properties: {
        name:  { type: 'text',    analyzer: 'standard' },
        email: { type: 'keyword'                        },
        phone: { type: 'keyword'                        },
      },
    })

    await this._ensureIndex('getapet_pets', {
      properties: {
        name:        { type: 'text',    analyzer: 'standard' },
        description: { type: 'text',    analyzer: 'standard' },
        color:       { type: 'keyword'                        },
        available:   { type: 'boolean'                        },
      },
    })

    this._ready = true
    console.log(`[ElasticsearchAdapter] conectado em ${AppConfig.elasticsearchUrl}`)
  }

  // ------------------------------------------------------------------ //
  //  SearchPort API                                                      //
  // ------------------------------------------------------------------ //

  async indexUser(doc) {
    this._assertReady()
    await this._client.index({
      index: 'getapet_users',
      id:    String(doc.id),
      document: {
        name:  doc.name,
        email: doc.email,
        phone: doc.phone || '',
      },
    })
  }

  async indexPet(doc) {
    this._assertReady()
    await this._client.index({
      index: 'getapet_pets',
      id:    String(doc.id),
      document: {
        name:        doc.name,
        description: doc.description || '',
        color:       doc.color || '',
        available:   doc.available !== undefined ? doc.available : true,
      },
    })
  }

  async searchUsers(query) {
    this._assertReady()
    const result = await this._client.search({
      index: 'getapet_users',
      query: {
        multi_match: {
          query,
          fields:    ['name^2', 'email'],
          fuzziness: 'AUTO',
        },
      },
      size: 20,
    })
    return result.hits.hits.map((h) => ({ id: h._id, ...h._source }))
  }

  async searchPets(query) {
    this._assertReady()
    const result = await this._client.search({
      index: 'getapet_pets',
      query: {
        multi_match: {
          query,
          fields:    ['name^3', 'description^2', 'color'],
          fuzziness: 'AUTO',
        },
      },
      size: 20,
    })
    return result.hits.hits.map((h) => ({ id: h._id, ...h._source }))
  }

  async deleteUser(id) {
    this._assertReady()
    await this._client.delete({ index: 'getapet_users', id: String(id) })
  }

  async deletePet(id) {
    this._assertReady()
    await this._client.delete({ index: 'getapet_pets', id: String(id) })
  }

  async ping() {
    if (!this._client) return false
    try {
      await this._client.ping()
      return true
    } catch {
      return false
    }
  }

  // ------------------------------------------------------------------ //
  //  Helpers privados                                                    //
  // ------------------------------------------------------------------ //

  async _ensureIndex(name, mappings) {
    const exists = await this._client.indices.exists({ index: name })
    if (!exists) {
      await this._client.indices.create({ index: name, mappings })
      console.log(`[ElasticsearchAdapter] índice '${name}' criado`)
    }
  }

  _assertReady() {
    if (!this._ready) {
      throw new Error(
        'ElasticsearchAdapter não foi inicializado. ' +
        'Chame await searchService.init() antes de usar.',
      )
    }
  }
}

module.exports = ElasticsearchAdapter
