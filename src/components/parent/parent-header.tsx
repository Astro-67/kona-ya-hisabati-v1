'use client'

import { Link, useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  Gamepad2,
  Home,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'


function getInitials(user: any) {
  if (!user) return ''
  if (user.first_name || user.last_name) {
    const first = user.first_name ? user.first_name[0].toUpperCase() : ''
    const last = user.last_name ? user.last_name[0].toUpperCase() : ''
    return `${first}${last}`
  }
  const name = user.name || user.username || user.email || ''
  return name
    .split(' ')
    .map((s: string) => s[0].toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join('')
}

function getFullName(user: any) {
  if (!user) return ''
  const first = (user.first_name ?? user.firstName) || ''
  const last = (user.last_name ?? user.lastName) || ''
  if (first || last) return `${first} ${last}`.trim()
  return user.name || user.username || user.email || ''
}

function getChildInitials(name: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((s: string) => s[0].toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join('')
}

const navItems = [
  { to: '/parent', label: 'Dashboard', icon: Home },
  { to: '/parent/home-activities', label: 'Activities', icon: Gamepad2 },
  { to: '/parent/guides', label: 'Guide', icon: BookOpen },
]

function getActiveChildIdFromRouter(state: ReturnType<typeof useRouterState>) {
  for (let i = state.matches.length - 1; i >= 0; i -= 1) {
    const params = state.matches[i]?.params as Record<string, string> | undefined
    if (params?.childId) return String(params.childId)
  }
  return null
}

export function ParentHeader() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouterState()
  const currentPath = router.location.pathname
  const activeChildId = useRouterState({
    select: getActiveChildIdFromRouter,
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

  const isActiveRoute = (path: string) => {
    if (path === '/parent') return currentPath === '/parent'
    return currentPath.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 lg:px-6">
          <Link
            to="/parent"
            className="flex items-center gap-2.5 group min-w-0 justify-self-start"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md group-hover:scale-105 transition-transform">
              <span
                className="text-xl font-bold text-primary-foreground"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                K
              </span>
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-secondary border-2 border-card" />
            </div>
            <div className="hidden sm:block">
              <span
                className="text-lg font-bold text-primary"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Kona Ya Hisabati
              </span>
              <p className="text-[10px] text-muted-foreground leading-none">
                Parent Portal
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 justify-self-center">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveRoute(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-foreground hover:bg-primary/10 hover:text-primary'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3 justify-self-end min-w-0">
            {activeChildName && (
              <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-success/10 border border-success/20">
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-success">
                    <AvatarFallback className="bg-success text-success-foreground text-xs font-bold">
                      {getChildInitials(activeChildName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-card animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground leading-none">
                    Now Playing
                  </span>
                  <span className="text-sm font-bold text-success leading-tight">
                    {activeChildName}
                  </span>
                </div>
                <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
              </div>
            )}

            <div className="hidden lg:block h-8 w-px bg-border" />

            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2.5 px-2 py-1.5 h-auto rounded-xl hover:bg-muted"
                  >
                    <Avatar className="h-9 w-9 border-2 border-secondary shadow-sm">
                      <AvatarImage src={(user as any)?.avatar || '/placeholder.svg'} alt={getFullName(user)} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-bold text-sm">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start text-left">
                      <span className="text-sm font-semibold text-foreground leading-tight">
                        {getFullName(user)}
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-none">
                        Parent Account
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-2">
                    <Avatar className="h-11 w-11 border-2 border-secondary">
                      <AvatarImage src={(user as any)?.avatar || '/placeholder.svg'} alt={getFullName(user)} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {getFullName(user)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5">
                    <User className="mr-2.5 h-4 w-4 text-muted-foreground" />
                    <span>View Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5">
                    <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer rounded-lg py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="mr-2.5 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <button
              className="flex md:hidden items-center justify-center h-10 w-10 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Toggle menu"
              onClick={() => setIsOpen((s) => !s)}
            >
              {isOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-card border-b shadow-lg',
          isOpen ? 'max-h-125 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <Avatar className="h-12 w-12 border-2 border-secondary shadow-sm">
              <AvatarImage src={(user as any)?.avatar || '/placeholder.svg'} alt={getFullName(user)} />
              <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {getFullName(user)}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                Parent Account
              </span>
            </div>
          </div>

          {activeChildName && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-success">
                  <AvatarFallback className="bg-success text-success-foreground font-bold text-sm">
                    {getChildInitials(activeChildName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-card animate-pulse" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-success/80">Currently Playing</p>
                <p className="text-sm font-bold text-success">{activeChildName}</p>
              </div>
              <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
            </div>
          )}

          <div className="h-px bg-border" />

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveRoute(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="h-px bg-border" />

          <button
            onClick={() => {
              setIsOpen(false)
              logout()
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 font-semibold transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
