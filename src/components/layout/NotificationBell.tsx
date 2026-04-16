"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, Package, Star, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  NEW_MESSAGE: MessageCircle,
  NEW_ORDER: ShoppingBag,
  ORDER_STATUS: Package,
  NEW_REVIEW: Star,
};

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Polling toutes les 15 secondes
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleClick = (notif: Notification) => {
    setOpen(false);
    if (notif.link) router.push(notif.link);
  };

  return (
    <DropdownMenu open={open} onOpenChange={(o) => { setOpen(o); if (o) fetchNotifications(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-[480px] overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-accent hover:underline cursor-pointer">
              Tout marquer lu
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Aucune notification
          </div>
        ) : (
          notifications.map((notif, i) => {
            const Icon = TYPE_ICONS[notif.type] ?? Bell;
            return (
              <DropdownMenuItem
                key={notif.id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer",
                  !notif.isRead && "bg-accent/5"
                )}
                onClick={() => handleClick(notif)}
              >
                <div className={cn(
                  "mt-0.5 p-1.5 rounded-full shrink-0",
                  !notif.isRead ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm leading-tight", !notif.isRead && "font-semibold")}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />
                )}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
