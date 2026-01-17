import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { fastifyCors } from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { env } from './env'
import { mongo } from './plugins/db'
import { createAccount } from './http/create-account'
import { jwtPlugin } from './plugins/jwt'
import { authenticateWithPassword } from '@/http/authenticate-with-password'
import { auth } from './plugins/auth'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})

app.register(mongo)
app.register(jwtPlugin)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'CHT Server API',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(ScalarApiReference, {
  routePrefix: '/docs',
})

app.get('/health', async () => {
  await app.mongo.client.db().command({ ping: 1 })
  return { ok: true }
})

app.register(createAccount, { prefix: '/session' })
app.register(authenticateWithPassword, { prefix: '/session' })
app.register(auth)

app.listen({ port: env.PORT, host: env.HOST }).then(() => {
  console.log('🔥 HTTP server is running on http://localhost:3333')
  console.log('📖 Swagger docs available at http://localhost:3333/docs')
})
