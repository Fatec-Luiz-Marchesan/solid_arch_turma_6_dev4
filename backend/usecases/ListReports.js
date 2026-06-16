/**
 * Use Case: ListReports aqui mostra todos os reports do site neste
 * caso mostra todas as denúncias deitas pelos usuários
 * Retorna todos os reportes do banco, ordenados pelo mais recente.
 * Filtragem opcional por targetType, targetId e status (passados como
 * objeto de filtros). A filtragem é só pra ajudar um pouquinho a facilitar
 *
 * Não conhece Express (req/res).
 */

const { Report, STATUS } = require('../models/Report')
const ObjectId = require('mongoose').Types.ObjectId

const TARGET_TYPES = ['pet', 'user']

// Só aceita um valor se ele for uma string "primitiva" (não array, não
// objeto) - é essa checagem que neutraliza payloads como {$ne: ...}.
const isPlainString = (value) => typeof value === 'string'

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
    if (
      isPlainString(filters.targetType) &&
      TARGET_TYPES.includes(filters.targetType)
    ) {
      query.targetType = filters.targetType
    }

    if (isPlainString(filters.targetId) && ObjectId.isValid(filters.targetId)) {
      query.targetId = new ObjectId(filters.targetId)
    }

    if (isPlainString(filters.status) && STATUS.includes(filters.status)) {
      query.status = filters.status
    }

    return Report.find(query).sort('-createdAt')
  }
}

module.exports = new ListReports()

module.exports = new ListReports()
