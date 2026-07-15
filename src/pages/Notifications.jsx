import React from 'react'
import StudentLayout from '../layouts/StudentLayout'
import { useNotification } from '../context/NotificationContext'
import { notificationService } from '../services/notificationService'
import NotificationItem from '../components/notifications/NotificationItem'
import { CheckCheck, BellOff } from 'lucide-react'

export default function Notifications() {
    const { markAllRead } = useNotification() // Only using context for badge management
    const [notifications, setNotifications] = React.useState([])
    const [loading, setLoading] = React.useState(true)

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getNotifications()
            setNotifications(data)
        } catch (error) {
            console.error('Failed to load notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        loadNotifications()
    }, [])

    const handleRead = async (id) => {
        // Optimistic update
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
        await notificationService.markAsRead(id)
    }

    const handleMarkAllRead = async () => {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })))
        await notificationService.markAllAsRead()
        markAllRead() // Update context badge
    }

    return (
        <StudentLayout>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                    <h1 className="text-xl font-bold text-slate-900">Notifications</h1>

                    {notifications.length > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm text-ttu-blue hover:text-blue-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="divide-y divide-slate-100 min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-pulse">
                            <div className="h-8 w-8 bg-slate-200 rounded-full mb-4"></div>
                            <div className="h-4 w-48 bg-slate-200 rounded"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <BellOff className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No notifications yet</h3>
                            <p className="text-sm text-slate-500 max-w-xs text-center mt-1">
                                When you get friend requests, likes, or comments, they'll show up here.
                            </p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onRead={handleRead}
                            />
                        ))
                    )}
                </div>
            </div>
        </StudentLayout>
    )
}
