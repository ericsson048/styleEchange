"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Send, Loader2, Image as ImageIcon, Mic, MicOff, X, Play, Pause, Info, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type ChatSummary = {
  id: string; name: string; avatar: string;
  online: boolean; time: string; lastMsg: string; unread: number;
};

type ChatMessage = {
  id: string;
  text: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  sender: "me" | "them";
  senderName: string;
  senderAvatar?: string | null;
  time: string;
  createdAt: string;
};

type ThreadData = {
  id: string;
  summary: ChatSummary;
  messages: ChatMessage[];
};

interface Props { threads: ThreadData[]; meId: string; }

// ── Composant bulle audio ──────────────────────────────────────────────────
function AudioBubble({ src, isMe }: { src: string; isMe: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { a.play(); }
    setPlaying(!playing);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-2xl min-w-[180px]",
      isMe ? "bg-accent text-accent-foreground" : "bg-card border text-foreground")}>
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={(e) => setProgress((e.currentTarget.currentTime / (e.currentTarget.duration || 1)) * 100)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      <button onClick={toggle} className="shrink-0 cursor-pointer">
        {playing
          ? <Pause className="h-5 w-5" />
          : <Play className="h-5 w-5" />}
      </button>
      <div className="flex-1 space-y-1">
        <div className="h-1.5 rounded-full bg-current/20 overflow-hidden">
          <div className="h-full bg-current/70 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] opacity-70">{fmt(duration)}</span>
      </div>
    </div>
  );
}

// ── Composant bulle message ────────────────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isMe = message.sender === "me";
  return (
    <div className={cn("flex flex-col max-w-[75%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
      {message.mediaType === "image" && message.mediaUrl && (
        <div className="rounded-2xl overflow-hidden max-w-[240px] shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={message.mediaUrl} alt="Image" className="w-full object-cover max-h-64" />
        </div>
      )}
      {message.mediaType === "audio" && message.mediaUrl && (
        <AudioBubble src={message.mediaUrl} isMe={isMe} />
      )}
      {message.text && (
        <div className={cn(
          "px-4 py-2.5 rounded-2xl text-sm shadow-sm mt-1",
          isMe ? "bg-accent text-accent-foreground rounded-tr-sm" : "bg-card text-foreground rounded-tl-sm border"
        )}>
          {message.text}
        </div>
      )}
      <span className="text-[10px] text-muted-foreground mt-1 px-1">{message.time}</span>
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────
export function MessagesPageClient({ threads: initialThreads, meId }: Props) {
  const searchParams = useSearchParams();
  const threadParam = searchParams.get("thread");
  const { toast } = useToast();

  const [threads, setThreads] = useState(initialThreads);
  const [activeIdx, setActiveIdx] = useState(() => {
    if (threadParam) {
      const idx = initialThreads.findIndex((t) => t.id === threadParam);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  // Image preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Audio recording
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentThread = threads[activeIdx];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentThread?.messages.length]);

  // Polling
  const pollMessages = useCallback(async () => {
    if (!currentThread) return;
    try {
      const res = await fetch(`/api/messages/threads/${currentThread.id}`);
      if (!res.ok) return;
      const data = await res.json();
      const msgs: any[] = data.messages;
      const otherOnline: boolean = data.otherOnline ?? false;
      setThreads((prev) =>
        prev.map((t, i) =>
          i !== activeIdx ? t : {
            ...t,
            summary: { ...t.summary, lastMsg: msgs[msgs.length - 1]?.text || (msgs[msgs.length - 1]?.mediaType === "image" ? "📷 Image" : msgs[msgs.length - 1]?.mediaType === "audio" ? "🎤 Audio" : t.summary.lastMsg), unread: 0, online: otherOnline },
            messages: msgs.map((m) => ({
              id: m.id, text: m.text, mediaUrl: m.mediaUrl, mediaType: m.mediaType,
              sender: m.senderId === meId ? ("me" as const) : ("them" as const),
              senderName: m.senderName, senderAvatar: m.senderAvatar,
              time: new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
              createdAt: m.createdAt,
            })),
          }
        )
      );
    } catch {}
  }, [currentThread, activeIdx, meId]);

  useEffect(() => {
    pollMessages();
    const interval = setInterval(pollMessages, 4000);
    return () => clearInterval(interval);
  }, [pollMessages]);

  // ── Envoi ──────────────────────────────────────────────────────────────
  const doSend = async (payload: { text?: string; mediaUrl?: string; mediaType?: "image" | "audio" }) => {
    if (!currentThread) return;
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const preview: ChatMessage = {
      id: tempId,
      text: payload.text ?? "",
      mediaUrl: payload.mediaUrl ?? null,
      mediaType: payload.mediaType ?? null,
      sender: "me",
      senderName: "Moi",
      senderAvatar: null,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      createdAt: now,
    };

    setThreads((prev) => prev.map((t, i) => i !== activeIdx ? t : { ...t, messages: [...t.messages, preview] }));

    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: currentThread.id, ...payload }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast({ title: "Erreur", description: d.error, variant: "destructive" });
        setThreads((prev) => prev.map((t, i) => i !== activeIdx ? t : { ...t, messages: t.messages.filter((m) => m.id !== tempId) }));
      }
    } catch {
      setThreads((prev) => prev.map((t, i) => i !== activeIdx ? t : { ...t, messages: t.messages.filter((m) => m.id !== tempId) }));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const sendText = async () => {
    if (!text.trim() || sending) return;
    const msg = text.trim();
    setText("");
    await doSend({ text: msg });
  };

  // ── Image ──────────────────────────────────────────────────────────────
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: "Image trop lourde (max 5 Mo)", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const sendImage = async () => {
    if (!imagePreview || sending) return;
    const preview = imagePreview;
    setImagePreview(null);
    await doSend({ mediaUrl: preview, mediaType: "image" });
  };

  // ── Audio ──────────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      toast({ title: "Microphone inaccessible", description: "Autorisez l'accès au microphone.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const sendAudio = async () => {
    if (!audioBlob || sending) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setAudioBlob(null);
      setAudioPreviewUrl(null);
      setRecordingSeconds(0);
      await doSend({ mediaUrl: dataUrl, mediaType: "audio" });
    };
    reader.readAsDataURL(audioBlob);
  };

  const cancelAudio = () => {
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    setRecordingSeconds(0);
  };

  const fmtSec = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const filteredThreads = threads.filter((t) =>
    t.summary.name.toLowerCase().includes(search.toLowerCase()) ||
    t.summary.lastMsg.toLowerCase().includes(search.toLowerCase())
  );

  if (threads.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-10 text-center text-muted-foreground">Aucun message pour le moment.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border rounded-2xl overflow-hidden bg-card h-full shadow-lg">

        {/* Thread list */}
        <div className="md:col-span-4 lg:col-span-3 border-r flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold mb-3 font-headline">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9 bg-muted/50 border-none" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.map((chat) => {
              const realIdx = threads.findIndex((t) => t.id === chat.id);
              return (
                <div key={chat.id} onClick={() => setActiveIdx(realIdx)}
                  className={cn("flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors", activeIdx === realIdx && "bg-muted border-r-4 border-accent")}>
                  <div className="relative shrink-0">
                    <div className="h-11 w-11 rounded-full overflow-hidden bg-muted">
                      <img src={chat.summary.avatar} alt={chat.summary.name} className="object-cover w-full h-full" />
                    </div>
                    {chat.summary.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className={cn("text-sm truncate", chat.summary.unread > 0 && "font-bold")}>{chat.summary.name}</h3>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-1">{chat.summary.time}</span>
                    </div>
                    <p className={cn("text-xs truncate", chat.summary.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {chat.summary.lastMsg}
                    </p>
                  </div>
                  {chat.summary.unread > 0 && (
                    <span className="shrink-0 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{chat.summary.unread}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        {currentThread ? (
          <div className="md:col-span-8 lg:col-span-9 flex flex-col bg-muted/20">
            {/* Header */}
            <div className="p-4 bg-card border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                  <img src={currentThread.summary.avatar} alt={currentThread.summary.name} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{currentThread.summary.name}</h3>
                  <p className={cn("text-[10px] font-medium", currentThread.summary.online ? "text-green-500" : "text-muted-foreground")}>
                    {currentThread.summary.online ? "En ligne" : "Hors ligne"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon"><Info className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {currentThread.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Preview image */}
            {imagePreview && (
              <div className="px-4 pt-3 bg-card border-t">
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-xl border" />
                  <button onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Button size="sm" onClick={sendImage} disabled={sending} className="ml-3 bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer l'image"}
                </Button>
              </div>
            )}

            {/* Preview audio */}
            {audioPreviewUrl && (
              <div className="px-4 pt-3 bg-card border-t flex items-center gap-3">
                <audio src={audioPreviewUrl} controls className="h-8 flex-1" />
                <Button size="sm" onClick={sendAudio} disabled={sending} className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer shrink-0">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer"}
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelAudio} className="cursor-pointer shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Input bar */}
            <div className="p-4 bg-card border-t">
              {recording ? (
                /* Barre d'enregistrement */
                <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse shrink-0" />
                  <span className="text-sm font-medium text-destructive flex-1">Enregistrement… {fmtSec(recordingSeconds)}</span>
                  <Button size="sm" variant="ghost" onClick={stopRecording} className="gap-1.5 cursor-pointer text-destructive hover:text-destructive">
                    <MicOff className="h-4 w-4" />
                    Arrêter
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Bouton image */}
                  <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0 cursor-pointer"
                    onClick={() => imageInputRef.current?.click()}>
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }} />

                  {/* Champ texte */}
                  <Input
                    ref={inputRef}
                    placeholder="Écrivez votre message..."
                    className="bg-muted/50 border-none focus-visible:ring-1"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); } }}
                    disabled={sending}
                  />

                  {/* Bouton micro */}
                  <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0 cursor-pointer"
                    onClick={startRecording} disabled={sending}>
                    <Mic className="h-5 w-5" />
                  </Button>

                  {/* Bouton envoyer */}
                  <Button onClick={sendText} disabled={!text.trim() || sending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full w-10 h-10 p-0 shrink-0 cursor-pointer">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="md:col-span-8 lg:col-span-9 flex items-center justify-center text-muted-foreground">
            Sélectionnez une conversation
          </div>
        )}
      </div>
    </div>
  );
}
