import { Link } from '@tanstack/react-router'

export function ParentFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 md:flex-row">
        <div className="text-sm text-muted-foreground">© {year} Kona Ya Hisabati</div>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link to="/parent" className="hover:text-(--color-primary)">
            Dashboard
          </Link>

          <Link to="/parent/home-activities" className="hover:text-(--color-primary)">
            Home Activities
          </Link>

          <Link to="/parent/guides" className="hover:text-(--color-primary)">
            Guide
          </Link>

          <Link to="/privacy" className="hover:text-(--color-primary)">
            Privacy
          </Link>

          <Link to="/contact" className="hover:text-(--color-primary)">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}

export default ParentFooter
