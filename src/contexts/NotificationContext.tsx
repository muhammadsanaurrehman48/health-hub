import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import api from '@/utils/api';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  source?: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Map backend notification types to UI types
const mapNotificationType = (backendType: string): Notification['type'] => {
  switch (backendType) {
    case 'invoice_created':
    case 'consultation_completed':
    case 'vitals_recorded':
      return 'success';
    case 'lab_request':
    case 'radiology_request':
      return 'warning';
    case 'prescription_dispensed':
      return 'info';
    default:
      return 'info';
  }
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('hms_token');
      if (!token) return; // Not logged in

      const response = await api.getNotifications(1, 50);
      if (response.success && Array.isArray(response.data)) {
        const mapped: Notification[] = response.data.map((n: any) => ({
          id: n._id || n.id,
          type: mapNotificationType(n.type),
          title: n.title,
          message: n.message,
          timestamp: new Date(n.createdAt || n.timestamp),
          read: n.read || false,
          source: n.relatedType || n.source,
          link: n.actionUrl || n.link,
        }));
        setNotifications(mapped);
      }
    } catch (error) {
      // Silently fail — notifications are non-critical
      console.debug('Notification fetch error:', error);
    }
  }, []);

  // Poll for notifications every 15 seconds
  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 15000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchNotifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await api.markNotificationAsRead(id);
    } catch (e) {
      // fail silently
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await api.markAllNotificationsAsRead();
    } catch (e) {
      // fail silently
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await api.deleteNotification(id);
    } catch (e) {
      // fail silently
    }
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
