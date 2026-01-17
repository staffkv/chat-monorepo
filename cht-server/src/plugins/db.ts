import fp from 'fastify-plugin'
import mongodb from '@fastify/mongodb'

export const mongo = fp(async (app) => {
  await app.register(mongodb, {
    url: process.env.MONGO_URI!,
    database: process.env.MONGO_DB_NAME ?? 'chatrepodb',
    forceClose: true,
  })
})
