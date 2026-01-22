import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-between py-12 px-6">
      {/* Hero */}
      <header className="w-full">
        <div className="mx-auto max-w-4xl text-center">
          <img src="/logo.svg" alt="Kona Ya Hisabati" className="mx-auto h-20" />
          <h1 className="mt-6 text-3xl md:text-5xl font-extrabold text-center">
            Kona Ya Hisabati - Interactive Math Learning
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Kona Ya Hisabati makes math engaging for children through interactive activities,
            progress tracking, and teacher-led lesson plans. Parents can follow their child’s
            journey and teachers can create class assignments with ease.
          </p>
        </div>
      </header>

      {/* Cards */}
      <section className="w-full max-w-4xl mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/parent/login" className="block">
          <div className="h-full rounded-xl p-6 shadow-lg flex flex-col items-start justify-between overflow-hidden transform transition-transform hover:scale-[1.01]" style={{ background: 'linear-gradient(135deg,#0ea5e9 0%, #0369a1 100%)' }}>
            <div>
              <div className="w-20 h-20 rounded-md bg-white/20 flex items-center justify-center">{/* SVG placeholder */}
                <div className="w-12 h-12 rounded bg-white/30" />
              </div>

              <h2 className="mt-4 text-xl font-semibold text-white">Get Started as Parent</h2>
              <p className="mt-2 text-white/90">Sign up or login to track your child’s progress and access home activities.</p>
            </div>

            <Button className={cn("mt-6 min-h-17.5 w-full text-lg", "bg-white text-[#0369a1]")}>Continue as Parent</Button>
          </div>
        </Link>

        <Link to="/teacher/login" className="block">
          <div className="h-full rounded-xl p-6 shadow-lg flex flex-col items-start justify-between overflow-hidden transform transition-transform hover:scale-[1.01]" style={{ background: 'linear-gradient(135deg,#facc15 0%, #f59e0b 100%)' }}>
            <div>
              <div className="w-20 h-20 rounded-md bg-black/5 flex items-center justify-center">{/* SVG placeholder */}
                <div className="w-12 h-12 rounded bg-black/10" />
              </div>

              <h2 className="mt-4 text-xl font-semibold text-black">Get Started as Teacher</h2>
              <p className="mt-2 text-black/80">Create classes, assignments, and access lesson plans to support student learning.</p>
            </div>

            <Button className={cn("mt-6 min-h-17.5 w-full text-lg", "bg-black text-white")}>Continue as Teacher</Button>
          </div>
        </Link>
      </section>

      {/* Footer */}
      <footer className="w-full mt-12 border-t py-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} Kona Ya Hisabati</div>

          <nav className="flex gap-4">
            <Link to="/about" className="text-sm hover:underline text-muted-foreground">About</Link>
            <Link to="/contact" className="text-sm hover:underline text-muted-foreground">Contact</Link>
            <Link to="/privacy" className="text-sm hover:underline text-muted-foreground">Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </main>
  )
}
