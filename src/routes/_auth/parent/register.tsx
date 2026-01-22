import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toaster'

const phoneRegex = /^\+?[0-9]{7,15}$/
const passwordStrength = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/

const registerSchema = z
  .object({
    name: z.string().min(2, 'Please enter your name'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional().refine((v) => !v || phoneRegex.test(v), {
      message: 'Enter a valid phone number',
    }),
    password: z.string().min(8, 'Password must be at least 8 characters').refine((v) => passwordStrength.test(v), {
      message: 'Password must contain letters and numbers',
    }),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type RegisterFormData = z.infer<typeof registerSchema>

export const Route = createFileRoute('/_auth/parent/register')({
  component: ParentRegister,
})

export default function ParentRegister() {
  const navigate = useNavigate()

  const { register, handleSubmit, formState, reset } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      }
      const response = await apiClient.post('/users/parent/register/', payload)
      return response.data
    },
    onSuccess: () => {
      toast.success('Registration successful! Please login.')
      reset()
      navigate({ to: '/parent/login' })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Registration failed')
    },
  })

  const onSubmit = (data: RegisterFormData) => registerMutation.mutate(data)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parent Registration</CardTitle>
        <CardDescription>Create an account to track your child's progress</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Full name</label>
            <Input type="text" placeholder="Jane Doe" {...register('name')} />
            {formState.errors.name ? <p className="text-sm text-destructive mt-1">{String(formState.errors.name.message)}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Email</label>
            <Input type="email" placeholder="parent@example.com" {...register('email')} />
            {formState.errors.email ? <p className="text-sm text-destructive mt-1">{String(formState.errors.email.message)}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Phone (optional)</label>
            <Input type="tel" placeholder="+255712345678" {...register('phone')} />
            {formState.errors.phone ? <p className="text-sm text-destructive mt-1">{String(formState.errors.phone.message)}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Password</label>
            <Input type="password" placeholder="Create a password" {...register('password')} />
            {formState.errors.password ? <p className="text-sm text-destructive mt-1">{String(formState.errors.password.message)}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Confirm password</label>
            <Input type="password" placeholder="Confirm password" {...register('confirmPassword')} />
            {formState.errors.confirmPassword ? <p className="text-sm text-destructive mt-1">{String(formState.errors.confirmPassword.message)}</p> : null}
          </div>

          <Button type="submit" className="w-full" disabled={registerMutation.isPending} aria-busy={registerMutation.isPending}>
            {registerMutation.isPending ? 'Creating account...' : 'Register'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/parent/login" className="text-(--color-primary) hover:underline">
            Login here
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
