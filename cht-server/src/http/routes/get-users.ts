import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { auth } from '@/plugins/auth'

export async function getUsers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/users',
      {
        schema: {
          tags: ['Users'],
          summary: 'Listar usuários com status online/offline',
          description: 'Retorna todos os usuários cadastrados com status de presença em tempo real.',
          response: {
            200: z.object({
              users: z.array(
                z.object({
                  _id: z.string(),
                  name: z.string(),
                  username: z.string(),
                  status: z.enum(['online', 'offline']),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        await request.jwtVerify<{ sub: string }>()

        const usersCollection = app.mongo.db!.collection('users')

        const users = await usersCollection
          .find(
            {},
            { projection: { passwordHash: 0 } },
          )
          .toArray()

        return reply.send({
          users: users.map((user) => ({
            _id: user._id.toString(),
            name: user.name,
            username: user.username,
            status: app.presence?.isOnline(user._id.toString())
              ? 'online'
              : 'offline',
          })),
        })
      },
    )
}
