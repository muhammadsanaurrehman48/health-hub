import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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

// Mock initial notifications for demo
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'New Lab Request',
    message: 'Dr. Ahmad Khan has requested CBC for patient F-12345',
    timestamp: new Date(Date.now() - 5 * 60000), // 5 mins ago
    read: false,
    source: 'Laboratory',
    link: '/laboratory/requests',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Low Stock Alert',
    message: 'Paracetamol 500mg is running low (50 units remaining)',
    timestamp: new Date(Date.now() - 30 * 60000), // 30 mins ago
    read: false,
    source: 'Inventory',
    link: '/inventory/alerts',
  },
  {
    id: '3',
    type: 'success',
    title: 'Prescription Filled',
    message: 'Rx #4521 for Muhammad Ali has been dispensed',
    timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
    read: true,
    source: 'Pharmacy',
  },
  {
    id: '4',
    type: 'info',
    title: 'New Referral Received',
    message: 'Patient Sara Bibi referred to Cardiology department',
    timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
    read: true,
    source: 'Doctor',
    link: '/doctor/referrals',
  },
  {
    id: '5',
    type: 'error',
    title: 'Critical Lab Result',
    message: 'Urgent: Abnormal ECG findings for patient F-12347',
    timestamp: new Date(Date.now() - 10 * 60000), // 10 mins ago
    read: false,
    source: 'Laboratory',
    link: '/laboratory/results',
  },
];

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
