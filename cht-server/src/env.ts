import z from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number(),
  HOST: z.string(),
  MONGO_URI: z.string(),
})

export const env = envSchema.parse(process.env)
