import { UnauthorizedError } from '../http/routes/_errors/unauthorized-error'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

export const auth = fp(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()
        return sub
      } catch {
        throw new UnauthorizedError('Invalid auth token')
      }
    }
  })
})
