import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { createAccountSchema } from './schemas/createAccountSchema'
import { hash } from 'bcryptjs'
import z from 'zod'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Registrar uma nova conta de usuário',
        description: 'Cria uma nova conta de usuário com nome, nome de usuário e senha.',
        body: createAccountSchema
      },
    },
    async (request, reply) => {
      const { name, username, password } = request.body
      const users = app.mongo.db!.collection('users')

      const exists = await users.findOne({ username })
      if (exists) return reply.code(400).send({ message: 'Username já existe' })

      const passwordHash = await hash(password, 6)

      await users.insertOne({
        name,
        username,
        passwordHash,
        createdAt: new Date(),
      })

      return reply.code(201).send()
    },
  )
}
