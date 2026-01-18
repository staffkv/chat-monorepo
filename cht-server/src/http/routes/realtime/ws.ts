import fp from 'fastify-plugin'
import websocket from '@fastify/websocket'
import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { WebSocket } from 'ws'
import { ObjectId } from 'mongodb'

const wsInboundSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('message:send'),
    payload: z.object({
      to: z.string().min(1),
      content: z.string().min(1),
    }),
  }),
])

function isOpen(ws: WebSocket) {
  return (ws as any).readyState === 1
}

export const wsPlugin = fp(async (app: FastifyInstance) => {
  await app.register(websocket)

  const socketsByUser = new Map<string, Set<WebSocket>>()

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
    for (const ws of set) {
      if (isOpen(ws)) ws.send(data)
    }
  }

  app.get('/ws', { websocket: true }, (connection, req) => {
    const ws = connection.socket

    // ===== handshake logs =====
    app.log.info(
      {
        url: req.url,
        hasJwt: !!(app as any).jwt,
        hasMongoDb: !!(app as any).mongo?.db,
        auth: req.headers.authorization?.slice(0, 20),
      },
      'WS handshake'
    )

    // ===== AUTH (Insomnia) =====
    const auth =
      (req.headers['authorization'] as string | undefined) ||
      (req.headers['Authorization'] as unknown as string | undefined)

    if (!auth || !auth.startsWith('Bearer ')) {
      app.log.warn({ auth }, 'WS unauthorized: missing Bearer')
      ws.close(1008, 'UNAUTHORIZED')
      return
    }

    let userId: string
    try {
      const token = auth.slice(7)
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

    // ===== MESSAGE HANDLER =====
    ws.on('message', async (raw) => {
      console.log('📩 WS RECEBI:', raw.toString())
      app.log.info({ raw: raw.toString() }, 'WS message received (raw)')

      // 1) parse JSON
      let parsed: unknown
      try {
        parsed = JSON.parse(raw.toString())
      } catch (err) {
        app.log.warn({ err }, 'WS invalid JSON')
        send(ws, { type: 'error', payload: { message: 'Invalid JSON' } })
        return
      }

      // 2) validar schema
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

      // 3) valida destinatário
      if (!ObjectId.isValid(to)) {
        app.log.warn({ to }, 'WS invalid recipient ObjectId')
        send(ws, { type: 'error', payload: { message: 'Invalid recipient id' } })
        return
      }

      // 4) DB ops com try/catch completo
      try {
        if (!app.mongo?.db) {
          app.log.error('WS mongo db is undefined (app.mongo.db)')
          send(ws, { type: 'error', payload: { message: 'Database unavailable' } })
          return
        }

        const db = app.mongo.db
        const users = db.collection('users')
        const conversations = db.collection('conversations')
        const messages = db.collection('messages')

        // (opcional) mostra em que DB está
        app.log.info({ dbName: db.databaseName }, 'WS using DB')

        const toObjId = new ObjectId(to)

        // garante que "to" existe
        const exists = await users.findOne({ _id: toObjId })
        if (!exists) {
          app.log.warn({ to }, 'WS recipient not found in users')
          send(ws, { type: 'error', payload: { message: 'Recipient not found' } })
          return
        }

        // conversa
        const participants = [userId, to].sort()
        const conv = await conversations.findOneAndUpdate(
          { participants },
          {
            $setOnInsert: { participants, createdAt: new Date() },
            $set: { updatedAt: new Date() },
          },
          { upsert: true, returnDocument: 'after' }
        )

        const conversationId = conv.value!._id.toString()

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

        const dto = {
          _id: result.insertedId.toString(),
          ...doc,
        }

        // realtime
        sendToUser(to, { type: 'message:new', payload: dto })
        send(ws, { type: 'message:sent', payload: dto })
      } catch (err) {
        app.log.error({ err }, 'WS failed to save message')
        send(ws, { type: 'error', payload: { message: 'Failed to save message' } })
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
