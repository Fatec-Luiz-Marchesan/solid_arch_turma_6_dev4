const express = require('express')
const cors = require('cors')
const http = require('http')

const app = express()

// Config JSON response
app.use(express.json())

// Solve CORS
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

// Public folder for images and Socket.io PoC page
app.use(express.static('public'))

// Routes
const PetRoutes = require('./routers/PetRouters')
const UserRoutes = require('./routers/UserRouters')

app.use('/pets', PetRoutes)
app.use('/users', UserRoutes)

// Servidor HTTP "puro", necessario para o Socket.io poder
// fazer o upgrade da conexao (HTTP -> WebSocket) no mesmo socket
// usado pelo Express. (falta um S aí né pois a porta 80 já está muito manjada! sabe aquele
// protocolinho que foi desenvolvido no CERN o Grande Colisor de Hadrons e a camada de segurança desenvolvida
// no meio dos anos 90 por uma empresa tal de Netscape RIP.)
const server = http.createServer(app)

// Plugando o adapter de tempo real (Socket.io) como um plugin externo.
// Nenhum Model, Use Case ou Controller precisa conhecer este import -
// eles recebem apenas a instancia `realtimeNotifier` (ver infra/realtime).
const { realtimeNotifier } = require('./infra/realtime')
realtimeNotifier.init(server, { corsOrigin: 'http://localhost:3000' })

server.listen(5000, () => {
  console.log('Servidor rodando na porta 5000 (HTTP + Socket.io)')
})
