"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Send, Image as ImageIcon, Phone, Info, MoreVertical } from "lucide-react"
import { PlaceHolderImages } from "@/app/lib/placeholder-images"
import { cn } from "@/lib/utils"

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(0)

  const chats = [
    { id: 1, name: "Marie Vintage", lastMsg: "Est-ce que le prix est négociable ?", time: "12:30", avatar: PlaceHolderImages[6].imageUrl, online: true },
    { id: 2, name: "Lucas Style", lastMsg: "Parfait, je l'envoie demain !", time: "Hier", avatar: PlaceHolderImages[7].imageUrl, online: false },
    { id: 3, name: "Sophie Mode", lastMsg: "Oui, c'est du vrai cuir.", time: "Lun", avatar: PlaceHolderImages[6].imageUrl, online: true },
  ]

  const messages = [
    { id: 1, text: "Bonjour, je suis intéressé par votre veste.", sender: "me", time: "10:00" },
    { id: 2, text: "Bonjour ! Super, elle est encore disponible.", sender: "them", time: "10:05" },
    { id: 3, text: "Est-ce que le prix est négociable ?", sender: "me", time: "12:30" },
  ]

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border rounded-2xl overflow-hidden bg-white h-full shadow-lg">
        
        {/* Sidebar Chats */}
        <div className="md:col-span-4 lg:col-span-3 border-r flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold mb-4 font-headline">Messages</h1>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9 bg-muted/50 border-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat, i) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(i)}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                  activeChat === i && "bg-muted border-r-4 border-accent"
                )}
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                    <img src={chat.avatar} alt={chat.name} className="object-cover w-full h-full" />
                  </div>
                  {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold truncate">{chat.name}</h3>
                    <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col bg-slate-50">
          <div className="p-4 bg-white border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                <img src={chats[activeChat].avatar} alt={chats[activeChat].name} className="object-cover w-full h-full" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{chats[activeChat].name}</h3>
                <p className="text-[10px] text-green-500 font-medium">En ligne</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><Info className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  m.sender === "me" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "p-4 rounded-2xl text-sm shadow-sm",
                  m.sender === "me" ? "bg-accent text-accent-foreground rounded-tr-none" : "bg-white text-primary rounded-tl-none"
                )}>
                  {m.text}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">{m.time}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <Button variant="ghost" size="icon" className="text-muted-foreground"><ImageIcon className="h-5 w-5" /></Button>
              <Input placeholder="Écrivez votre message..." className="bg-muted/50 border-none focus-visible:ring-1" />
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full w-10 h-10 p-0">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}