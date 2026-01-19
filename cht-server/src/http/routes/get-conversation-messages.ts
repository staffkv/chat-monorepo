import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { auth } from '../../plugins/auth'
import { ObjectId } from 'mongodb'

export async function getConversationMessages(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/conversations/with/:userId/messages',
      {
        schema: {
          tags: ['Chat'],
          summary: 'Buscar histórico de mensagens com um usuário',
          params: z.object({
            userId: z.string().min(1),
          }),
          querystring: z.object({
            limit: z.coerce.number().min(1).max(50).default(30),
            before: z.string().optional(),
          }),
          response: {
            200: z.object({
              conversationId: z.string().nullable(),
              messages: z.array(
                z.object({
                  _id: z.string(),
                  conversationId: z.string(),
                  from: z.string(),
                  to: z.string(),
                  content: z.string(),
                  createdAt: z.coerce.date(),
                }),
              ),
            }),
          },
        },
      },
      async (request) => {
        const { sub } = await request.jwtVerify<{ sub: string }>()
        const { userId } = request.params
        const { limit, before } = request.query

        if (!ObjectId.isValid(userId)) {
          return { conversationId: null, messages: [] }
        }

        const db = app.mongo.db!
        const conversations = db.collection('conversations')
        const messages = db.collection('messages')

        const participants = [sub, userId].sort()

        const conv = await conversations.findOne({ participants }, { projection: { _id: 1 } })
        if (!conv?._id) {
          return { conversationId: null, messages: [] }
        }

        const conversationId = conv._id.toString()

        const filter: any = { conversationId }
        if (before) {
          const beforeDate = new Date(before)
          if (!Number.isNaN(beforeDate.getTime())) {
            filter.createdAt = { $lt: beforeDate }
          }
        }

        const rows = await messages
          .find(filter)
          .sort({ createdAt: -1 })
          .limit(limit)
          .toArray()
        rows.reverse()

        return {
          conversationId,
          messages: rows.map((m: any) => ({
            _id: m._id.toString(),
            conversationId: m.conversationId,
            from: m.from,
            to: m.to,
            content: m.content,
            createdAt: m.createdAt,
          })),
        }
      },
    )
}
