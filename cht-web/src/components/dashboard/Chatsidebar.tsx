'use client'

import { cn } from '@/lib/utils'

type ChatSidebarProps = {
  children: React.ReactNode
  className?: string
}

export function ChatSidebar({ children, className }: ChatSidebarProps) {
  return (
    <aside className={cn('w-80 border-r border-border bg-white', className)}>
      {children}
    </aside>
  )
}

export function ChatSidebarHeader({ children }: { children: React.ReactNode }) {
  return (
    <header className="px-4 py-3 border-b border-border">
      {children}
    </header>
  )
}

export function ChatSidebarMain({ children }: { children: React.ReactNode }) {
  return (
    <main className="p-2 overflow-y-auto h-[calc(100vh-56px)]">
      {children}
    </main>
  )
}

type ChatListItemProps = {
  active?: boolean
  onClick?: () => void
  title: string
  subtitle?: string
  status?: 'online' | 'offline'
  badgeCount?: number
}

export function ChatListItem({
  active,
  onClick,
  title,
  subtitle,
  status,
  badgeCount,
}: ChatListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition',
        active && 'bg-slate-100',
      )}
    >
      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold">
        {title.slice(0, 1).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium truncate">{title}</span>
          <div className="flex items-center gap-2">
            {status && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    status === 'online' ? 'bg-green-500' : 'bg-slate-400',
                  )}
                />
                {status === 'online' ? 'Online' : 'Offline'}
              </span>
            )}
            {!!badgeCount && badgeCount > 0 && (
              <span className="min-w-5 px-2 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                {badgeCount}
              </span>
            )}
          </div>
        </div>

        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
    </button>
  )
}
