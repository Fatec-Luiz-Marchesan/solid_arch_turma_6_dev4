/**
 * ReportController
 *
 * Camada HTTP (tratamento de req/res). Aquela ruim faltando o S Porta 80
 * Não contém regra de negócio - delega tudo para os Use Cases.
 * 
 * Responsável apenas por:
 *   1. Extrair e validar dados da requisição (obrigatoriedade, formato).
 *   2. Chamar o Use Case correspondente.
 *   3. Formatar a resposta HTTP.
 *
 * Clean Architecture: Controller > Use Case > Model > você sabe coisa do MVC 
 * que a gente aprende na faculdade
 */

const { REASONS } = require('../models/Report')
const ObjectId = require('mongoose').Types.ObjectId

// Use Cases
const createReport        = require('../usecases/CreateReport')
const listReports         = require('../usecases/ListReports')
const updateReportStatus  = require('../usecases/UpdateReportStatus')

// Helpers existentes (mesma abordagem do PetController)
const getToken        = require('../helpers/get-token')
const getUserByToken  = require('../helpers/get-user-by-token')

module.exports = class ReportController {
  // POST /reports
  static async create(req, res) {
    try {
      const { reason, description, targetType, targetId } = req.body

      // --- validações de entrada (responsabilidade do Controller) ---
      if (!reason) {
        return res.status(422).json({ message: 'O motivo é obrigatório. Preciso explicar mais?' })
      }

      if (!REASONS.includes(reason)) {
        return res.status(422).json({
          message: `Motivo inválido. Valores aceitos: ${REASONS.join(', ')}.`,
        })
      }

      if (!description || description.trim().length < 10) {
        return res.status(422).json({
          message: 'A descrição é obrigatória e deve ter no mínimo 10 caracteres. Você não pode deixar em branco! O que está pensando?',
        })
      }

      if (description.trim().length > 1000) {
        return res.status(422).json({
          message: 'A descrição deve ter no máximo 1000 caracteres. Pelo menos isso! É uma descrição e não um tweet!',
        })
      }

      if (!targetType || !['pet', 'user'].includes(targetType)) {
        return res.status(422).json({
          message: "O tipo do alvo é obrigatório e deve ser 'pet' ou 'user'! O sistema em si serve pra denunciar alguém! Você não pode denunciar o vazio!.",
        })
      }

      if (!targetId || !ObjectId.isValid(targetId)) {
        return res.status(422).json({ message: 'O ID do alvo é inválido.! Coloque um ID válido! Como você quer que eu ache?' })
      }

      // --- usuário autenticado (via token, mesmo padrão do PetController) ---
      const token = getToken(req)
      const user  = await getUserByToken(token)

      // --- delega a regra de negócio ao Use Case ---
      const report = await createReport.execute({
        reason,
        description: description.trim(),
        targetType,
        targetId,
        reporter: { _id: user._id, name: user.name },
      })

      return res.status(201).json({
        message: 'Reporte enviado com sucesso! Você acaba de dedurar alguém!',
        report,
      })
    } catch (err) {
      const status = err.message === 'Você não pode reportar a si mesmo. O quê que você está pensando? Endoidou?' ? 422 : 500
      return res.status(status).json({ message: err.message })
    }
  }

  // GET /reports
  static async getAll(req, res) {
    try {
      const { targetType, targetId, status } = req.query
      const filters = {}

      if (targetType) filters.targetType = targetType
      if (targetId)   filters.targetId   = targetId
      if (status)     filters.status     = status

      const reports = await listReports.execute(filters)

      return res.status(200).json({ reports })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  // PATCH /reports/:id/status
  static async updateStatus(req, res) {
    try {
      const { id }     = req.params
      const { status } = req.body

      if (!status) {
        return res.status(422).json({ message: 'O status é obrigatório.' })
      }

      const report = await updateReportStatus.execute(id, status)

      return res.status(200).json({
        message: 'Status atualizado com sucesso!',
        report,
      })
    } catch (err) {
      const notFound = err.message === 'Reporte não encontrado. Você está procurando certo?'
      const invalid  = err.message.startsWith('Status inválido') ||
                       err.message === 'ID de reporte inválido.'
      const status   = notFound ? 404 : invalid ? 422 : 500
      return res.status(status).json({ message: err.message })
    }
  }
}
