'use server'

import { createAccount } from '@/http/create-account'
import { HTTPError } from 'ky'
import { z } from 'zod'

const RegisterSchema = z.object({
  name: z.string().min(1, { message: 'Informe o nome' }),
  username: z.string().min(1, { message: 'Informe o usuário' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
})

export async function registerWithUsernameAndPassword(input: FormData) {
  const result = RegisterSchema.safeParse(Object.fromEntries(input))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, message: null, errors }
  }

  const { name, username, password } = result.data

  try {
    await createAccount({ name, username, password })
  } catch (error) {
    if (error instanceof HTTPError) {
      const { nome, mensagem } = await error.response.json()
      return { success: false, message: `${nome}: ${mensagem}`, errors: null }
    }

    return { success: false, message: 'Erro inesperado, tente novamente', errors: null }
  }

  return { success: true, message: null, errors: null }
}
