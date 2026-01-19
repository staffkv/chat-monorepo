import websocket from '@fastify/websocket'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { ObjectId } from 'mongodb'
import type { WebSocket } from 'ws'
import { z } from 'zod'

const wsInboundSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('message:send'),
    payload: z.object({
      to: z.string().min(1),
      content: z.string().min(1),
    }),
  }),
])

function isOpen(ws?: WebSocket) {
  return !!ws && (ws as any).readyState === 1
}

export const wsPlugin = fp(async (app: FastifyInstance) => {
  await app.register(websocket)

  const socketsByUser = new Map<string, Set<WebSocket>>()

  app.decorate('presence', {
    isOnline: (userId: string) => {
      const set = socketsByUser.get(userId)
      return !!set && set.size > 0
    },
    onlineUserIds: () => Array.from(socketsByUser.keys()),
  })

  function add(userId: string, ws: WebSocket) {
    const set = socketsByUser.get(userId) ?? new Set()
    set.add(ws)
    socketsByUser.set(userId, set)
  }

  function remove(userId: string, ws: WebSocket) {
    const set = socketsByUser.get(userId)
    if (!set) return
    set.delete(ws)
    if (set.size === 0) socketsByUser.delete(userId)
  }

  function send(ws: WebSocket, msg: unknown) {
    if (!isOpen(ws)) return
    ws.send(JSON.stringify(msg))
  }

  function sendToUser(userId: string, msg: unknown) {
    const set = socketsByUser.get(userId)
    if (!set) return
    const data = JSON.stringify(msg)
    for (const ws of set) if (isOpen(ws)) ws.send(data)
  }

  app.get('/ws', { websocket: true }, (connection, req) => {
    const ws: WebSocket =
      ((connection as any).socket ??
        (connection as any).ws ??
        (connection as any)) as WebSocket

    if (!ws || typeof (ws as any).send !== 'function') {
      app.log.error(
        { connectionKeys: Object.keys(connection as any) },
        'WS socket not found on connection'
      )
      return
    }

    app.log.info(
      {
        url: req.url,
        hasJwt: !!(app as any).jwt,
        hasMongoDb: !!(app as any).mongo?.db,
        authPrefix: req.headers.authorization?.slice(0, 20),
      },
      'WS handshake'
    )

    const auth =
      (req.headers['authorization'] as string | undefined) ||
      (req.headers['Authorization'] as unknown as string | undefined)

    const tokenFromHeader = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    const tokenFromQuery = (req.query as any)?.token ? String((req.query as any).token) : null
    const token = tokenFromHeader ?? tokenFromQuery

    if (!token) {
      app.log.warn({ auth, hasTokenQuery: !!tokenFromQuery }, 'WS unauthorized: missing token')
      ws.close(1008, 'UNAUTHORIZED')
      return
    }

    let userId: string
    try {
      const payload = app.jwt.verify(token) as { sub: string }
      userId = payload.sub
      app.log.info({ userId }, 'WS auth ok')
    } catch (err) {
      app.log.error({ err }, 'WS JWT verify failed')
      ws.close(1008, 'UNAUTHORIZED')
      return
    }

    add(userId, ws)
    send(ws, { type: 'connected', payload: { userId } })

    ws.on('message', async (raw) => {
      app.log.info({ raw: raw.toString() }, '📩 WS message received')

      let parsed: unknown
      try {
        parsed = JSON.parse(raw.toString())
      } catch (err) {
        app.log.warn({ err }, 'WS invalid JSON')
        send(ws, { type: 'error', payload: { message: 'Invalid JSON' } })
        return
      }

      const input = wsInboundSchema.safeParse(parsed)
      if (!input.success) {
        app.log.warn({ issues: input.error.issues }, 'WS bad message format')
        send(ws, { type: 'error', payload: { message: 'Bad message format' } })
        return
      }

      const { to, content } = input.data.payload
      const trimmed = content.trim()

      app.log.info({ from: userId, to, contentLen: trimmed.length }, 'WS message parsed')

      if (!trimmed) return

      if (!ObjectId.isValid(to)) {
        app.log.warn({ to }, 'WS invalid recipient ObjectId')
        send(ws, { type: 'error', payload: { message: 'Invalid recipient id' } })
        return
      }

      try {
        if (!app.mongo?.db) {
          app.log.error('WS mongo db is undefined (app.mongo.db)')
          send(ws, { type: 'error', payload: { message: 'Database unavailable' } })
          return
        }

        const db = app.mongo.db
        app.log.info({ dbName: db.databaseName }, 'WS using DB')

        const users = db.collection('users')
        const conversations = db.collection('conversations')
        const messages = db.collection('messages')

        const toObjId = new ObjectId(to)

        const exists = await users.findOne({ _id: toObjId }, { projection: { _id: 1 } })
        if (!exists) {
          app.log.warn({ to }, 'WS recipient not found in users')
          send(ws, { type: 'error', payload: { message: 'Recipient not found' } })
          return
        }

        const participants = [userId, to].sort()

        await conversations.updateOne(
          { participants },
          {
            $setOnInsert: { participants, createdAt: new Date() },
            $set: { updatedAt: new Date() },
          },
          { upsert: true }
        )

        const convDoc = await conversations.findOne(
          { participants },
          { projection: { _id: 1 } }
        )

        if (!convDoc?._id) {
          app.log.error({ participants }, 'WS failed to create/find conversation')
          send(ws, { type: 'error', payload: { message: 'Failed to create/find conversation' } })
          return
        }

        const conversationId = convDoc._id.toString()

        const doc = {
          conversationId,
          from: userId,
          to,
          content: trimmed,
          createdAt: new Date(),
        }

        app.log.info({ doc }, 'WS inserting message')

        const result = await messages.insertOne(doc)
        app.log.info({ insertedId: result.insertedId.toString() }, 'WS message inserted')

        const dto = { _id: result.insertedId.toString(), ...doc }

        sendToUser(to, { type: 'message:new', payload: dto })
        send(ws, { type: 'message:sent', payload: dto })
        sendToUser(to, {
          type: 'notification:new-message',
          payload: {
            conversationId: dto.conversationId,
            from: dto.from,
            contentPreview: dto.content.slice(0, 80),
            createdAt: dto.createdAt,
        },
})
      } catch (err: any) {
        app.log.error({ err }, 'WS failed to save message')
        send(ws, {
          type: 'error',
          payload: { message: 'Failed to save message', details: err?.message ?? String(err) },
        })
      }
    })

    ws.on('close', (code, reason) => {
      app.log.info({ userId, code, reason: reason?.toString() }, 'WS closed')
      remove(userId, ws)
    })

    ws.on('error', (err) => {
      app.log.error({ err, userId }, 'WS error')
    })
  })
})
