/**
 * elastic-smoke-test.js
 *
 * PoC / smoke test da integração ElasticSearch.
 * Executa fora do Express - útil para validar a conexão antes de subir
 * o servidor completo. Pra você não crashar a esteira de Deploy!
 *
 * Uso:
 *   ELASTICSEARCH_ENABLED=true \
 *   ELASTICSEARCH_URL=http://localhost:9200 \
 *   node ./infra/search/elastic-smoke-test.js
 *
 * Ou via npm:
 *   npm run test:elastic
 */

process.env.ELASTICSEARCH_ENABLED = 'true'

const { searchService } = require('./index')

async function run() {
  console.log('\n🔍  ElasticSearch Smoke Test\n')

  // 1. Init
  console.log('1️⃣  Inicializando adapter...')
  await searchService.init()

  // 2. Ping
  console.log('2️⃣  Ping...')
  const alive = await searchService.ping()
  console.log(`   → ${alive ? '✅ ok' : '❌ falhou'}`)
  if (!alive) { process.exit(1) }

  // 3. Indexar documentos de teste
  console.log('3️⃣  Indexando documentos de teste...')
  await searchService.indexUser({
    id:    'smoke-user-1',
    name:  'João Silva',
    email: 'joao@exemplo.com',
    phone: '16999990001',
  })
  await searchService.indexPet({
    id:          'smoke-pet-1',
    name:        'Golden',
    description: 'Cachorro brincalhão e amigável',
    color:       'dourado',
    available:   true,
  })
  await searchService.indexPet({
    id:          'smoke-pet-2',
    name:        'Bolinha',
    description: 'Gato laranja muito fofo',
    color:       'laranja',
    available:   false,
  })
  console.log('   → ✅ documentos indexados')

  // Pequena pausa para o ElasticSearch processar o refresh alguns milisegundos
  await new Promise(r => setTimeout(r, 1500))

  // 4. Buscas
  console.log('4️⃣  Testando buscas...')

  const petResults = await searchService.searchPets('golden cachorro')
  console.log(`   searchPets("golden cachorro") → ${petResults.length} resultado(s):`)
  petResults.forEach(r => console.log(`      • [${r.id}] ${r.name} - ${r.description}`))

  const userResults = await searchService.searchUsers('joão')
  console.log(`   searchUsers("joão") → ${userResults.length} resultado(s):`)
  userResults.forEach(r => console.log(`      • [${r.id}] ${r.name} <${r.email}>`))

  // 5. Limpeza Olha o garbage collector aqui!
  console.log('5️⃣  Limpando documentos de teste...')
  await searchService.deletePet('smoke-pet-1')
  await searchService.deletePet('smoke-pet-2')
  await searchService.deleteUser('smoke-user-1')
  console.log('   → ✅ limpo')

  console.log('\n✅  Smoke test concluído com sucesso!\n')
  process.exit(0)
}

run().catch((err) => {
  console.error('\n❌  Smoke test falhou:', err.message)
  process.exit(1)
})
