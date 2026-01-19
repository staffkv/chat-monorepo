import { fastifyCors } from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { authenticateWithPassword } from '@/http/routes/auth/authenticate-with-password'
import { env } from './env'
import { errorHandler } from './http/error-handler'
import { createAccount } from './http/routes/auth/create-account'
import { getProfile } from './http/routes/auth/get-profile'
import { wsPlugin } from './http/routes/realtime/ws'
import { mongo } from './plugins/db'
import { jwtPlugin } from './plugins/jwt'
import { getUsers } from './http/routes/get-users'
import { getConversationMessages } from './http/routes/get-conversation-messages'

const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})

app.register(mongo)
app.register(jwtPlugin)
app.setErrorHandler(errorHandler)
app.register(wsPlugin)

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
app.register(getProfile)
app.register(getUsers)
app.register(getConversationMessages)

app.listen({ port: env.PORT, host: env.HOST }).then(() => {
  console.log('🔥 HTTP server is running on http://localhost:3333')
  console.log('📖 Swagger docs available at http://localhost:3333/docs')
})
