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

const registerSchema = z
  .object({
    name: z.string().min(2, 'Please enter your name'),
    email: z.string().email('Invalid email address'),
    school_name: z.string().min(2, 'Enter your school name'),
    subject: z.string().min(2, 'Enter your subject'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type RegisterFormData = z.infer<typeof registerSchema>

export const Route = createFileRoute('/_auth/teacher/register')({
  component: TeacherRegister,
})

export default function TeacherRegister() {
  const navigate = useNavigate()

  const { register, handleSubmit, formState, reset } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', school_name: '', subject: '', password: '', confirmPassword: '' },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const payload = {
        name: data.name,
        email: data.email,
        school_name: data.school_name,
        subject: data.subject,
        password: data.password,
      }
      const response = await apiClient.post('/users/teacher/register/', payload)
      return response.data
    },
    onSuccess: () => {
      toast.success('Registration successful! Please login.')
      reset()
      navigate({ to: '/teacher/login' })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Registration failed')
    },
  })

  const onSubmit = (data: RegisterFormData) => registerMutation.mutate(data)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Registration</CardTitle>
        <CardDescription>Create a teacher account to manage your classroom</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Full name</label>
            <Input type="text" placeholder="John Smith" {...register('name')} />
            {formState.errors.name ? <p className="text-sm text-destructive mt-1">{String(formState.errors.name.message)}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Email</label>
            <Input type="email" placeholder="teacher@school.edu" {...register('email')} />
            {formState.errors.email ? <p className="text-sm text-destructive mt-1">{String(formState.errors.email.message)}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">School name</label>
            <Input type="text" placeholder="Sunrise Primary" {...register('school_name')} />
            {formState.errors.school_name ? <p className="text-sm text-destructive mt-1">{String(formState.errors.school_name.message)}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Subject</label>
            <Input type="text" placeholder="Mathematics" {...register('subject')} />
            {formState.errors.subject ? <p className="text-sm text-destructive mt-1">{String(formState.errors.subject.message)}</p> : null}
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
          <Link to="/teacher/login" className="text-(--color-primary) hover:underline">
            Login here
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
