
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toaster'

export function AddChildDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { register, handleSubmit, reset, formState } = useForm<{ name: string; age?: number }>({ defaultValues: { name: '', age: undefined } })
  const qc = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; age?: number }) => {
      const res = await apiClient.post('/parent/children/', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Child added')
      qc.invalidateQueries({ queryKey: ['children'] })
      onOpenChange(false)
      reset()
    },
    onError: (err: any) => {
      console.error('Create child error', err)
      toast.error(err?.message || JSON.stringify(err?.data) || 'Failed to add child')
    },
  })

  const onSubmit = (data: { name: string; age?: number }) => {
    createMutation.mutate({ name: data.name.trim(), age: data.age })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />

      <div className="relative z-10 w-full max-w-md rounded-md border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Add Child</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Name</label>
            <Input {...register('name', { required: true, minLength: 2 })} placeholder="Child name" />
            {formState.errors.name ? <div className="text-sm text-destructive mt-1">Name is required</div> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Age (optional)</label>
            <Input {...register('age', { valueAsNumber: true })} type="number" placeholder="Age" />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} aria-busy={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Child'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddChildDialog
