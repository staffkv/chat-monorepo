'use server'

import { signInWithPassword } from "@/http/sign-in-with-password"
import { HTTPError } from "ky"

import { cookies } from "next/headers"

import { z } from "zod"

const SignInShema = z.object({
  username: z.string(),
  password: z.string().min(1, { message: 'Por favor, preencher a senha, minimo 6 caracteres' }),
})

export async function signInWithUsernameAndPassword(input: FormData){
  const result =  SignInShema.safeParse(Object.fromEntries(input))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors

    return { success: false, message: null, errors}
  }

  const { username, password } = result.data

 try {
  const { token } = await signInWithPassword({ 
    username, 
    password,
  })
  ;(await cookies()).set('token', token, ({
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: true,
  }))
 } catch (error) {
  if (error instanceof HTTPError) {
    const { nome, mensagem } = await error.response.json()

    return { success: false, message: `${nome}: ${mensagem}`, errors: null }
  }

  return {
    success: false,
    message: 'Erro inesperado, tente novamente',
    errors: null
  }
 }

  return { success: true, message: null, errors: null }
}