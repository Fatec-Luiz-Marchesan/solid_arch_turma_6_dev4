const router = require('express').Router();
const rateLimit = require('express-rate-limit'); // <--- 1. Importa a ferramenta
const SearchController = require('../controllers/SearchController');
const { verifyToken } = require('../middlewares/authMiddleware'); // ou o caminho correto do seu app

// 2. Cria a configuração do limitador de requisições
const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Janela de 15 minutos
    max: 100, // Limita cada IP a 100 requisições por janela
    message: {
        message: 'Muitas requisições de busca vindas deste IP. Tente novamente mais tarde.'
    },
    standardHeaders: true, // Retorna as informações de limite nos headers Ratelimit-*
    legacyHeaders: false, // Desabilita os headers X-RateLimit-* antigos
});

// Aplicando o limitador como middleware nas rotas de busca
router.get('/pets', searchLimiter, SearchController.searchPets);

// 3. Na rota que o CodeQL acusou, injetamos o searchLimiter bem ao lado do verifyToken
router.get('/users', verifyToken, searchLimiter, SearchController.searchUsers);

module.exports = router;