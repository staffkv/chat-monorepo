'use client'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LockClosedIcon } from '@radix-ui/react-icons'
import { RocketIcon, User2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GetProfile } from '@/http/get-profile'

type ProfileUser = {
  _id: string
  name: string
  username: string
}

export function UserDropdown() {
  const router = useRouter()
  const [user, setUser] = useState<ProfileUser | null>(null)

  useEffect(() => {
    ;(async () => {
      const profile = await GetProfile('')
      setUser(profile.user)
    })()
  }, [])

  const initials = useMemo(() => {
    if (!user) return '...'
    const source = user.name || user.username
    const parts = source.trim().split(/\s+/).slice(0, 2)
    return parts.map((part) => part[0]?.toUpperCase()).join('') || 'U'
  }, [user])

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/'
    router.push('/')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="link"
          className="relative h-8 flex items-center justify-between w-full space-x-2 px-0!"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel className="font-normal">
          {user && (
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                @{user.username}
              </p>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            handleLogout()
          }}
        >
          <LockClosedIcon className="w-4 h-4 mr-3" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
