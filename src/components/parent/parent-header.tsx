import { Link, useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { BookOpen, Home, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'


function getInitials(user: any) {
  if (!user) return '';
  // Prefer first_name and last_name if available
  if (user.first_name || user.last_name) {
    const first = user.first_name ? user.first_name[0].toUpperCase() : '';
    const last = user.last_name ? user.last_name[0].toUpperCase() : '';
    return `${first}${last}`;
  }
  // Fallback to name, username, or email
  const name = user.name || user.username || user.email || '';
  return name
    .split(' ')
    .map((s: string) => s[0].toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join('');
}

function getFullName(user: any) {
  if (!user) return '';
  const first = (user.first_name ?? user.firstName) || '';
  const last = (user.last_name ?? user.lastName) || '';
  if (first || last) return `${first} ${last}`.trim();
  return user.name || user.username || user.email || '';
}

export function ParentHeader() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const activeChildId = useRouterState({
    select: (state) => {
      for (let i = state.matches.length - 1; i >= 0; i -= 1) {
        const params = state.matches[i]?.params as Record<string, string> | undefined
        if (params?.childId) return String(params.childId)
      }
      return null
    },
  })

  const { data: activeChild } = useQuery({
    queryKey: ['parent-active-child', activeChildId],
    enabled: !!activeChildId && activeChildId !== 'undefined',
    queryFn: async () => {
      const res = await apiClient.get(`/parent/children/${activeChildId}/`)
      return res.data
    },
  })

  const activeChildName =
    activeChild?.child_name ||
    activeChild?.name ||
    activeChild?.username ||
    activeChild?.full_name ||
    null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <Link to="/parent" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-(--color-primary)" />
            <span className="text-lg font-semibold text-(--color-primary)">Kona Ya Hisabati</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/parent" className="text-sm font-medium hover:text-(--color-primary)">
            Dashboard
          </Link>
          <Link to="/parent/home-activities" className="text-sm font-medium hover:text-(--color-primary)">
            Home Activities
          </Link>
          <Link to="/parent/guides" className="text-sm font-medium hover:text-(--color-primary)">
            Guide
          </Link>
        </nav>

        {/* Right: avatar / mobile menu */}
        <div className="flex items-center gap-2">
          {activeChildName ? (
            <Badge className="hidden md:inline-flex bg-kids-blue/15 text-kids-blue border border-kids-blue/40 font-semibold">
              Active child: {activeChildName}
            </Badge>
          ) : null}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-(--color-kids-yellow)">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {getFullName(user)}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <button
            className="p-2 rounded-md md:hidden"
            aria-label="Toggle menu"
            onClick={() => setIsOpen((s) => !s)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {isOpen ? (
        <div className="md:hidden border-t bg-card">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
            {activeChildName ? (
              <Badge className="w-fit bg-kids-blue/15 text-kids-blue border border-kids-blue/40 font-semibold">
                Active child: {activeChildName}
              </Badge>
            ) : null}
            <Link to="/parent" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link to="/parent/home-activities" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
              <BookOpen className="h-4 w-4" />
              <span>Home Activities</span>
            </Link>
            <Link to="/parent/guides" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
              <BookOpen className="h-4 w-4" />
              <span>Guide</span>
            </Link>
            <button onClick={() => logout()} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted text-left">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
