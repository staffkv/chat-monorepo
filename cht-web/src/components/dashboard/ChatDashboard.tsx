'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Message = {
  _id: string
  from: string
  to: string
  content: string
  createdAt: string
}

type ChatWindowProps = {
  meId: string
  selectedUser?: { id: string; name: string; status?: 'online' | 'offline' } | null
  messages: Message[]
  onSend: (content: string) => void
}

export function ChatWindow({ meId, selectedUser, messages, onSend }: ChatWindowProps) {
  const [text, setText] = useState('')

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  if (!selectedUser) {
    return (
      <section className="flex-1 flex items-center justify-center bg-slate-50">
        <p className="text-muted-foreground">Selecione uma conversa</p>
      </section>
    )
  }

  return (
    <section className="flex-1 flex flex-col bg-slate-50">
      <header className="h-14 px-6 border-b border-border bg-white flex items-center justify-between">
        <div>
          <p className="font-semibold">{selectedUser.name}</p>
          <p className="text-xs text-muted-foreground">
            {selectedUser.status === 'online' ? 'Online' : 'Offline'}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((m) => {
          const isMine = m.from === meId
          return (
            <div key={m._id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[70%] rounded-2xl px-4 py-2 text-sm',
                isMine ? 'bg-blue-600 text-white' : 'bg-white border border-border'
              )}>
                <p>{m.content}</p>
                <p className={cn('text-[11px] mt-1 opacity-70', isMine ? 'text-white' : 'text-muted-foreground')}>
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <footer className="p-4 border-t border-border bg-white flex gap-2">
        <Input
          placeholder="Digite sua mensagem aqui"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend()
          }}
        />
        <Button onClick={handleSend}>Enviar</Button>
      </footer>
    </section>
  )
}
