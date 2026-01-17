import { z } from 'zod'

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  username: z.string().min(3, 'Username mínimo 3 caracteres'),
  password: z.string().min(6, 'Senha mínima 6 caracteres'),
})

export type CreateAccountBody = z.infer<typeof createAccountSchema>