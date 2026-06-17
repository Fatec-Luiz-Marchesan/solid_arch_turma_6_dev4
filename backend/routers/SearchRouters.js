const router = require('express').Router()

const SearchController = require('../controllers/SearchController')
const verifyToken = require('../helpers/check-token')

// GET /search/health - verificação de conectividade (público) Olha o POSTMAN aqui, esqueceu?
router.get('/health', SearchController.health)

// GET /search/pets?q=golden  - busca full-text de pets (público) pra você digitar o nome do Dogginho!
router.get('/pets', SearchController.searchPets)

// GET /search/users?q=joao   - busca full-text de usuários (requer auth)
router.get('/users', verifyToken, SearchController.searchUsers)

module.exports = router
