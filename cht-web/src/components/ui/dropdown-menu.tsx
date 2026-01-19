'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type DropdownContextValue = {
  open: boolean
  setOpen: (next: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
  contentRef: React.RefObject<HTMLDivElement>
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (contentRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-flex">{children}</div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({
  children,
  asChild = false,
}: {
  children: React.ReactNode
  asChild?: boolean
}) {
  const context = React.useContext(DropdownContext)
  if (!context) return null

  const handleClick = () => context.setOpen(!context.open)

  if (asChild && React.isValidElement(children)) {
    return (
      <span ref={context.triggerRef} className="inline-flex w-full">
        {React.cloneElement(children, {
          onClick: (event: React.MouseEvent) => {
            children.props.onClick?.(event)
            handleClick()
          },
        })}
      </span>
    )
  }

  return (
    <button ref={context.triggerRef as React.RefObject<HTMLButtonElement>} onClick={handleClick}>
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  children,
  className,
  align = 'end',
  forceMount,
}: {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'end'
  forceMount?: boolean
}) {
  const context = React.useContext(DropdownContext)
  if (!context) return null
  if (!context.open && !forceMount) return null

  return (
    <div
      ref={context.contentRef}
      className={cn(
        'absolute z-50 mt-2 min-w-[10rem] rounded-md border border-border bg-white p-1 shadow-md',
        align === 'end' ? 'right-0' : 'left-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('px-2 py-1.5 text-sm font-medium', className)}>{children}</div>
}

export function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>
}

export function DropdownMenuItem({
  children,
  className,
  onSelect,
}: {
  children: React.ReactNode
  className?: string
  onSelect?: (event: Event) => void
}) {
  const context = React.useContext(DropdownContext)
  return (
    <button
      type="button"
      onClick={(event) => {
        onSelect?.(event.nativeEvent)
        context?.setOpen(false)
      }}
      className={cn(
        'w-full flex items-center px-2 py-2 text-sm rounded-md hover:bg-slate-100',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn('my-1 h-px bg-slate-200', className)} />
}
