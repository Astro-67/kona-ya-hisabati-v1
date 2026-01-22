import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toaster'

const usernameRegex = /^[a-zA-Z0-9._-]{3,}$/
const emailRegex = /^\S+@\S+\.\S+$/

const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Enter an email or username')
    .refine((val) => emailRegex.test(val) || usernameRegex.test(val), {
      message: 'Enter a valid email or username',
    }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const Route = createFileRoute('/_auth/parent/login')({
  component: ParentLogin,
})

export default function ParentLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const { register, handleSubmit, formState } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      // Send identifier (email or username) and password — backend should accept identifier
      const response = await apiClient.post('/users/login/', {
        identifier: data.identifier,
        password: data.password,
      })
      return response.data
    },
    onSuccess: (data) => {
      login(data.token, data.user)
      toast.success('Login successful!')
      navigate({ to: '/parent' })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Login failed')
    },
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parent Login</CardTitle>
        <CardDescription>Sign in to track your child's progress (email or username)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Email or Username</label>
            <Input type="text" placeholder="parent@example.com or username" {...register('identifier')} />
            {formState.errors.identifier ? (
              <p className="text-sm text-destructive mt-1">{String(formState.errors.identifier.message)}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Password</label>
            <Input type="password" placeholder="••••••••" {...register('password')} />
            {formState.errors.password ? (
              <p className="text-sm text-destructive mt-1">{String(formState.errors.password.message)}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={loginMutation.isPending} aria-busy={loginMutation.isPending}>
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/parent/register" className="text-(--color-primary) hover:underline">
            Register here
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
