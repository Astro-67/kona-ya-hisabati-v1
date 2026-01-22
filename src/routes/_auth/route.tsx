import { Link, Outlet, createFileRoute  } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex items-start">
      <div className="container mx-auto px-4 py-8">
        {/* Header / Back */}
        <div className="mb-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Centered card */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-card rounded-xl shadow-sm p-6 sm:p-8">
            <div className="mb-6 text-center">
              <img src="/kona.png" alt="Kona Ya Hisabati" className="mx-auto h-16 w-auto" />
              <h1 className="mt-4 text-2xl font-bold text-(--color-primary)">Kona Ya Hisabati</h1>
            </div>

            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
