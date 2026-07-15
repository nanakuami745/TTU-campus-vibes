import React from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Heart, MessageCircle, Share2, Shield, CheckCircle, Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationItem({ notification, onRead }) {
    // Map backend structure to component needs
    const type = notification.type
    const sender = notification.actor
    const is_read = notification.is_read
    const created_at = notification.created_at
    const reference_id = notification.entity_id

    const getIcon = () => {
        switch (type) {
            case 'friend_request':
                return <UserPlus className="h-5 w-5 text-blue-500" />
            case 'request_accepted':
                return <UserPlus className="h-5 w-5 text-green-500" />
            case 'like':
                return <Heart className="h-5 w-5 text-red-500" />
            case 'comment':
                return <MessageCircle className="h-5 w-5 text-blue-500" />
            case 'post_approved':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'post_rejected':
                return <Shield className="h-5 w-5 text-red-600" />
            default:
                return <Bell className="h-5 w-5 text-slate-500" />
        }
    }

    const getContent = () => {
        switch (type) {
            case 'friend_request':
                return "sent you a friend request."
            case 'request_accepted':
                return "accepted your friend request."
            case 'like':
                return "liked your post."
            case 'comment':
                return "commented on your post."
            case 'post_approved':
                return "Your post has been approved and is now public."
            case 'post_rejected':
                return "Your post was rejected by an admin."
            default:
                return "New notification."
        }
    }

    const getLink = () => {
        switch (type) {
            case 'friend_request':
                return `/network`
            case 'request_accepted':
                return `/profile/${sender?.id}`
            case 'like':
            case 'comment':
            case 'post_approved':
                return `/` // Ideally anchor to post, but feed for now
            case 'post_rejected':
                return `/profile` // Go to profile to handle it
            default:
                return '#'
        }
    }

    const handleClick = () => {
        if (!is_read) {
            onRead(notification.id)
        }
    }

    return (
        <Link
            to={getLink()}
            onClick={handleClick}
            className={`block w-full p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 ${!is_read ? 'bg-blue-50/50' : 'bg-white'}`}
        >
            <div className="flex items-start gap-4">
                <div className="relative">
                    {sender ? (
                        <img
                            src={sender.avatar_url || `https://ui-avatars.com/api/?name=${sender.full_name}&background=random`}
                            alt={sender.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                            {getIcon()}
                        </div>
                    )}

                    {sender && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                            {getIcon()}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800">
                        {sender && <span className="font-semibold text-slate-900">{sender.full_name} </span>}
                        {getContent()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                    </p>
                </div>

                {!is_read && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                )}
            </div>
        </Link>
    )
}
