const jwt = require('jsonwebtoken')
jest.mock('../infra/config', () => ({
  jwtSecret: 'test-secret',
  mongoUri: 'mongodb://localhost:27017/test',
  corsOrigin: 'http://localhost:3000',
  nodeEnv: 'test',
  port: 5001,
}))

jest.mock('../db/conn', () => {
  const mongoose = require('mongoose')
  return mongoose
})

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
}))

const getToken = require('../helpers/get-token')
const checkToken = require('../helpers/check-token')
const getUserByToken = require('../helpers/get-user-by-token')
const User = require('../models/User')


/**
 * Gera um token JWT válido com o segredo de teste.
 * @param {object} payload
 * @returns {string}
 */
function makeToken(payload = { id: 'user123' }) {
  return jwt.sign(payload, 'test-secret')
}

/**
 * Cria um objeto req do Express com Authorization header opcional.
 * @param {string|null} token
 * @returns {object}
 */
function makeReq(token = null) {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  }
}

/**
 * Cria stubs de res e next para testar middlewares.
 * @returns {{ res: object, next: jest.fn }}
 */
function makeResNext() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }
  const next = jest.fn()
  return { res, next }
}

describe('Helper: get-token', () => {
  test('TC-01 — deve retornar o token quando Authorization header está presente', () => {
    const expectedToken = makeToken()
    const req = makeReq(expectedToken)

    const result = getToken(req)

    expect(result).toBe(expectedToken)
  })

  test('TC-02 — deve retornar undefined quando Authorization header está ausente', () => {
    const req = makeReq(null)

    const result = getToken(req)

    expect(result).toBeUndefined()
  })

  test('TC-03 — deve retornar undefined quando Authorization header não segue o padrão Bearer', () => {
    const req = { headers: { authorization: 'Basic abc123' } }

    const result = getToken(req)
    expect(typeof result).toBe('string')
  })
})

describe('Middleware: check-token', () => {
  test('TC-04 — deve chamar next() quando token é válido', () => {
    const token = makeToken({ id: 'user123' })
    const req = makeReq(token)
    const { res, next } = makeResNext()

    checkToken(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })

  test('TC-05 — deve popular req.user com o payload decodificado', () => {
    const payload = { id: 'user123' }
    const token = makeToken(payload)
    const req = makeReq(token)
    const { res, next } = makeResNext()

    checkToken(req, res, next)

    expect(req.user).toBeDefined()
    expect(req.user.id).toBe('user123')
  })

  test('TC-06 — deve retornar 401 quando token está ausente', () => {
    const req = makeReq(null)
    const { res, next } = makeResNext()

    checkToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Acesso negado!' })
    expect(next).not.toHaveBeenCalled()
  })

  test('TC-07 — deve retornar 400 quando token é inválido/adulterado', () => {
    const req = makeReq('token.invalido.aqui')
    const { res, next } = makeResNext()

    checkToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'O Token é inválido!' })
    expect(next).not.toHaveBeenCalled()
  })
})
describe('Helper: get-user-by-token', () => {
  afterEach(() => jest.clearAllMocks())

  test('TC-08 — deve retornar o usuário quando o token é válido e o usuário existe', async () => {
    const fakeUser = { _id: 'user123', name: 'Adotante Teste', email: 'teste@email.com' }
    User.findOne.mockResolvedValue(fakeUser)
    const token = makeToken({ id: 'user123' })

    const result = await getUserByToken(token)

    expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' })
    expect(result).toEqual(fakeUser)
  })

  test('TC-09 — deve retornar null quando o usuário não é encontrado no banco', async () => {
    User.findOne.mockResolvedValue(null)
    const token = makeToken({ id: 'nao-existe' })

    const result = await getUserByToken(token)

    expect(result).toBeNull()
  })

  test('TC-10 — deve lançar erro quando o token está expirado', async () => {
    const expiredToken = jwt.sign({ id: 'user123' }, 'test-secret', { expiresIn: 0 })

    await new Promise((resolve) => setTimeout(resolve, 1))

    await expect(getUserByToken(expiredToken)).rejects.toThrow()
  })
})

describe('Validação do schema Pet — campos obrigatórios (Mongoose)', () => {
  let Pet

  beforeAll(() => {
    Pet = require('../models/Pet')
  })

  test('TC-11 — deve falhar na validação quando o campo "name" está ausente', async () => {
    const pet = new Pet({
      age: 3,
      weight: 10,
      color: 'caramelo',
      images: ['foto.jpg'],
    })

    const error = pet.validateSync()

    expect(error).toBeDefined()
    expect(error.errors['name']).toBeDefined()
  })

  test('TC-12 — deve falhar na validação quando os campos numéricos obrigatórios ("age", "weight") estão ausentes', async () => {
    const pet = new Pet({
      name: 'Rex',
      color: 'preto',
      images: ['rex.jpg'],
    })

    const error = pet.validateSync()

    expect(error).toBeDefined()
    expect(error.errors['age']).toBeDefined()
    expect(error.errors['weight']).toBeDefined()
  })

  test('TC-13 — deve passar na validação quando todos os campos obrigatórios estão presentes', async () => {
    const pet = new Pet({
      name: 'Mel',
      age: 2,
      weight: 8,
      color: 'dourado',
      images: ['mel.jpg'],
    })

    const error = pet.validateSync()

    expect(error).toBeUndefined()
  })
})

describe('Helper: image-upload — fileFilter (extensões permitidas)', () => {
  let fileFilter

  beforeAll(() => {
    const multer = require('multer')
    const originalMulter = jest.requireActual('multer')

    let capturedFilter
    jest.spyOn(multer, 'diskStorage').mockReturnValue({})
    const originalMulterFn = jest.fn().mockImplementation((opts) => {
      capturedFilter = opts.fileFilter
      return { single: jest.fn(), array: jest.fn() }
    })

    jest.resetModules()
    jest.mock('multer', () => {
      const m = jest.fn().mockImplementation((opts) => {
        capturedFilter = opts.fileFilter
        return { single: jest.fn(), array: jest.fn() }
      })
      m.diskStorage = jest.fn().mockReturnValue({})
      return m
    })

    require('../helpers/image-upload')
    fileFilter = capturedFilter
  })

  afterAll(() => jest.restoreAllMocks())

  test('TC-14 — deve aceitar arquivos com extensão .jpg', () => {
    const req = {}
    const file = { originalname: 'foto.jpg' }
    const cb = jest.fn()

    fileFilter(req, file, cb)

    expect(cb).toHaveBeenCalledWith(undefined, true)
  })

  test('TC-15 — deve rejeitar arquivos com extensão não permitida (ex: .gif)', () => {
    const req = {}
    const file = { originalname: 'animacao.gif' }
    const cb = jest.fn()

    fileFilter(req, file, cb)

    expect(cb).toHaveBeenCalledWith(expect.any(Error))
    const [error] = cb.mock.calls[0]
    expect(error.message).toMatch(/png|jpg/i)
  })
})
