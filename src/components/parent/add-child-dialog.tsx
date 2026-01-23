

import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toaster'


export function AddChildDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { register, handleSubmit, reset, formState } = useForm<{ access_code: string }>({ defaultValues: { access_code: '' } })
  const qc = useQueryClient()

  const claimMutation = useMutation({
    mutationFn: async (payload: { access_code: string }) => {
      const res = await apiClient.post('/users/parent/claim-student/', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Student claimed successfully')
      qc.invalidateQueries({ queryKey: ['children'] })
      onOpenChange(false)
      reset()
    },
    onError: (err: any) => {
      console.error('Claim student error', err)
      toast.error(err?.message || JSON.stringify(err?.data) || 'Failed to claim student')
    },
  })

  const onSubmit = (data: { access_code: string }) => {
    claimMutation.mutate({ access_code: data.access_code.trim() })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />

      <div className="relative z-10 w-full max-w-md rounded-md border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Claim Student</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Access Code</label>
            <Input {...register('access_code', { required: true })} placeholder="Enter access code" />
            {formState.errors.access_code ? <div className="text-sm text-destructive mt-1">Access code is required</div> : null}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={claimMutation.isPending} aria-busy={claimMutation.isPending}>
              {claimMutation.isPending ? 'Claiming...' : 'Claim Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddChildDialog
