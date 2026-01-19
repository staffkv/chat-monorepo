'use client'

import { signInWithUsernameAndPassword } from '@/app/auth/sign-in/action'
import { Eye, EyeOff, Loader2, Mail } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignInForms() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await signInWithUsernameAndPassword(formData)

      if (!result.success) {
        if (result.errors) setFieldErrors(result.errors)
        if (result.message) setError(result.message)
        return
      }

      router.push('/app')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o chat
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(error || Object.keys(fieldErrors).length > 0) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error || 'Verifique os campos e tente novamente.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="seu_usuario"
                disabled={loading}
                required
              />
              {fieldErrors.username?.[0] && (
                <p className="text-sm text-red-600">{fieldErrors.username[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.senha?.[0] && (
                <p className="text-sm text-red-600">{fieldErrors.senha[0]}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Não tem uma conta?{' '}
              <a href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Criar conta
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
