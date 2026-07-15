import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { notificationService } from '../services/notificationService'


const NotificationContext = createContext()

export function useNotification() {
    return useContext(NotificationContext)
}

export function NotificationProvider({ children }) {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    const fetchNotifications = async () => {
        if (!user) return
        try {
            const [data, count] = await Promise.all([
                notificationService.getNotifications(),
                notificationService.getUnreadCount()
            ])
            setNotifications(data)
            setUnreadCount(count)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id) => {
        // Optimistic update
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))

        try {
            await notificationService.markAsRead(id)
        } catch (error) {
            console.error('Error marking as read:', error)
            // Revert on error if needed, but keeping simple for now
            fetchNotifications()
        }
    }

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)

        try {
            await notificationService.markAllAsRead()
        } catch (error) {
            console.error('Error marking all as read:', error)
            fetchNotifications()
        }
    }

    useEffect(() => {
        if (!user) {
            setNotifications([])
            setUnreadCount(0)
            return
        }

        fetchNotifications()

        // Real-time subscription
        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    // Fetch the full notification with sender details
                    // Or just add the payload with a placeholder sender if we want instant feedback
                    // For correctness, let's fetch the new list to get relations
                    fetchNotifications()

                    // Optional: Play sound or show toast here
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    const markRead = () => {
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const markAllRead = () => {
        setUnreadCount(0)
    }

    return (
        <NotificationContext.Provider value={{ unreadCount, markRead, markAllRead, fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    )
}
