import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
  }
  export interface FastifyInstance {
    presence: {
      isOnline(userId: string): boolean
      onlineUserIds(): string[]
    }
  }
}
