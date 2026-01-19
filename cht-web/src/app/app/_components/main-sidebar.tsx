'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatSidebar, ChatSidebarHeader, ChatSidebarMain, ChatListItem } from '@/components/dashboard/Chatsidebar'
import { ChatWindow } from '@/components/dashboard/ChatDashboard'
import { GetProfile } from '@/http/get-profile'
import { GetUsers } from '@/http/get-users'
import { GetConversationMessages } from '@/http/get-conversation'
import { UserDropdown } from '@/app/app/_components/user-dropdown'

type User = { _id: string; name: string; username: string; status: 'online' | 'offline' }
type Message = { _id: string; from: string; to: string; content: string; createdAt: string; conversationId: string }
type UiNotification = { id: string; title: string; body: string }

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function buildWsUrl(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
  const wsBase = baseUrl.replace(/^http/, 'ws')
  const url = new URL('/ws', wsBase)
  url.searchParams.set('token', token)
  return url.toString()
}

export function MainSidebar() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [meId, setMeId] = useState<string>('')
  const [notifications, setNotifications] = useState<UiNotification[]>([])
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const usersRef = useRef<User[]>([])
  const selectedUserIdRef = useRef<string | null>(null)

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null
    const user = users.find((u) => u._id === selectedUserId)
    if (!user) return null
    return { id: user._id, name: user.name, status: user.status }
  }, [users, selectedUserId])

  useEffect(() => {
    ;(async () => {
      const profile = await GetProfile('')
      setMeId(profile.user._id)

      const data = await GetUsers()
      setUsers(Array.isArray(data.users) ? data.users : [])
    })()
  }, [])

  const refreshUsers = async () => {
    const data = await GetUsers()
    setUsers(Array.isArray(data.users) ? data.users : [])
  }

  useEffect(() => {
    usersRef.current = users
  }, [users])

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId
  }, [selectedUserId])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshUsers()
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [])

  const pushNotification = (notification: UiNotification) => {
    setNotifications((prev) => prev.concat(notification))
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== notification.id))
    }, 4000)
  }

  useEffect(() => {
    const token = getCookie('token')
    if (!token) return

    const ws = new WebSocket(buildWsUrl(token))
    wsRef.current = ws

    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data?.type === 'connected') {
          void refreshUsers()
          return
        }
        if (data?.type !== 'message:new' && data?.type !== 'message:sent') return
        const msg = data.payload as Message
        if (!msg) return
        const activeUserId = selectedUserIdRef.current
        if (activeUserId && (msg.from === activeUserId || msg.to === activeUserId)) {
          setMessages((prev) => prev.concat(msg))
        }
        if (data?.type === 'message:new' && msg.from !== activeUserId) {
          setUnreadCounts((prev) => ({
            ...prev,
            [msg.from]: (prev[msg.from] ?? 0) + 1,
          }))
          const sender = usersRef.current.find((u) => u._id === msg.from)
          pushNotification({
            id: crypto.randomUUID(),
            title: sender?.name ?? 'Nova mensagem',
            body: msg.content.slice(0, 80),
          })
        }
      } catch {
        // ignore malformed messages
      }
    })

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!selectedUserId) return
    ;(async () => {
      const data = await GetConversationMessages({ userId: selectedUserId })
      setMessages(data.messages ?? [])
      setUnreadCounts((prev) => ({ ...prev, [selectedUserId]: 0 }))
    })()
  }, [selectedUserId])

  function handleSend(content: string) {
    if (!selectedUserId) return
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'message:send', payload: { to: selectedUserId, content } }))
      return
    }

    setMessages((prev) => prev.concat({
      _id: crypto.randomUUID(),
      conversationId: 'temp',
      from: meId,
      to: selectedUserId,
      content,
      createdAt: new Date().toISOString(),
    }))
  }

  return (
    <div className="h-screen flex">
      <ChatSidebar>
        <ChatSidebarHeader>
          <div className="font-semibold">Mensagens</div>
        </ChatSidebarHeader>

        <ChatSidebarMain>
          {users.map((u) => (
            <ChatListItem
              key={u._id}
              title={u.name}
              subtitle={`@${u.username}`}
              status={u.status}
              active={u._id === selectedUserId}
              badgeCount={unreadCounts[u._id]}
              onClick={() => {
                setSelectedUserId(u._id)
                setUnreadCounts((prev) => ({ ...prev, [u._id]: 0 }))
              }}
            />
          ))}

          <div className="mt-4 pt-3 border-t border-border">
            <UserDropdown />
          </div>
        </ChatSidebarMain>
      </ChatSidebar>

      <ChatWindow
        meId={meId}
        selectedUser={selectedUser}
        messages={messages}
        onSend={handleSend}
      />

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((item) => (
          <div key={item.id} className="w-64 rounded-lg border border-border bg-white shadow-md px-3 py-2">
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
