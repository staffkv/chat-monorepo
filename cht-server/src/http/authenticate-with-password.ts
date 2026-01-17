import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authenticateSchema } from '@/http/schemas/authenticateSchema'
import { compare } from 'bcryptjs'
import z from 'zod'

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Autenticar usuário com nome de usuário e senha',
        description: 'Autentica um usuário existente e retorna um token JWT.',
        body: authenticateSchema,
        response: ({
          401: z.object({
            message: z.string(),
          }),
          201: z.object({
            token: z.string(),
          })
        }),
      },
    },
    async (request, reply) => {
      const { username, password } = request.body
      const users = await app.mongo.db!.collection('users')
      const user = await users.findOne({ username })
      if (!user) {
        return reply.code(401).send({ message: 'Credenciais inválidas' })
      }

      const isValidPassword = await compare(password, user.passwordHash)
      if (!isValidPassword) {
        return reply.code(401).send({ message: 'Credenciais inválidas' })
      }

      const token = await reply.jwtSign({
        sub: user._id.toString(),
      }, {
        sign: { expiresIn: '7 days' },
      })

      return reply.status(201).send({ token })
    }
  )
}
