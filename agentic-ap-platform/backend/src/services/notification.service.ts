import { v4 as uuidv4 } from "uuid";
import { Notification, NotificationType } from "../models/types";
import { readJsonFile, writeJsonFile } from "../utils/storage";
import { paginate, sortBy } from "../utils/helpers";
import { getIO } from "../socket/io";

const FILE = "notifications.json";

function load(): Notification[] {
  return readJsonFile<Notification[]>(FILE, []);
}

function save(data: Notification[]) {
  writeJsonFile(FILE, data);
}

export const notificationService = {
  list(params: {
    page?: number;
    pageSize?: number;
    unreadOnly?: boolean;
  }) {
    let items = load();
    if (params.unreadOnly) {
      items = items.filter((n) => !n.read);
    }
    items = sortBy(items, "createdAt", "desc");
    return paginate(items, params.page ?? 1, params.pageSize ?? 20);
  },

  unreadCount(): number {
    return load().filter((n) => !n.read).length;
  },

  create(input: {
    type: NotificationType;
    title: string;
    message: string;
    entityId?: string;
    entityType?: "invoice" | "vendor";
  }): Notification {
    const items = load();
    const notification: Notification = {
      id: uuidv4(),
      type: input.type,
      title: input.title,
      message: input.message,
      entityId: input.entityId,
      entityType: input.entityType,
      read: false,
      createdAt: new Date().toISOString(),
    };
    items.unshift(notification);
    // Keep the inbox bounded for mock JSON storage
    save(items.slice(0, 500));

    try {
      const io = getIO();
      io.emit("notification:new", notification);
      io.emit("notification:unreadCount", this.unreadCount());
    } catch {
      // Socket may not be ready during seed
    }

    return notification;
  },

  markAsRead(id: string): Notification | null {
    const items = load();
    const idx = items.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], read: true };
    save(items);
    try {
      const io = getIO();
      io.emit("notification:unreadCount", this.unreadCount());
    } catch {
      /* noop */
    }
    return items[idx];
  },

  markAllAsRead(): number {
    const items = load().map((n) => ({ ...n, read: true }));
    save(items);
    try {
      const io = getIO();
      io.emit("notification:unreadCount", 0);
    } catch {
      /* noop */
    }
    return items.length;
  },

  clearAll(): void {
    save([]);
    try {
      const io = getIO();
      io.emit("notification:unreadCount", 0);
      io.emit("notifications:cleared");
    } catch {
      /* noop */
    }
  },
};
