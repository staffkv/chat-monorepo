import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { auth } from '../../../plugins/auth'

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/profile',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Buscar perfil do usuário autenticado',
          description: 'Retorna as informações do perfil do usuário autenticado.',
          response: {
            200: z.object({
              user: z.object({
                _id: z.string(),
                name: z.string(),
                username: z.string(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { sub } = await request.jwtVerify<{ sub: string }>()

        const users = app.mongo.db!.collection('users')

        const user = await users.findOne(
          { _id: new app.mongo.ObjectId(sub) },
          { projection: { passwordHash: 0 } },
        )

        if (!user) {
          throw new BadRequestError('User not found')
        }

        return reply.send({
          user: {
            _id: user._id.toString(),
            name: user.name,
            username: user.username,
          },
        })
      },
    )
}
