/**
 * Use Case: ListReports aqui mostra todos os reports do site neste
 * caso mostra todas as denúncias deitas pelos usuários
 * Retorna todos os reportes do banco, ordenados pelo mais recente.
 * Filtragem opcional por targetType, targetId e status (passados como
 * objeto de filtros). A filtragem é só pra ajudar um pouquinho a facilitar
 *
 * Não conhece Express (req/res).
 */

const { Report } = require('../models/Report')

class ListReports {
  /**
   * @param {object} [filters]
   * @param {string} [filters.targetType]  - 'pet' | 'user'
   * @param {string} [filters.targetId]    - ObjectId string
   * @param {string} [filters.status]      - 'open' | 'reviewing' | 'resolved' | 'dismissed'
   */
  async execute(filters = {}) {
    const query = {}
// aqui tem um monte de if aninhado para procurar os reports pelo tipo
    if (filters.targetType) query.targetType = filters.targetType
    if (filters.targetId)   query.targetId   = filters.targetId
    if (filters.status)     query.status      = filters.status

    return Report.find(query).sort('-createdAt')
  }
}

module.exports = new ListReports()
