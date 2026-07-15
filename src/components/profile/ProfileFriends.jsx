import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { friendService } from '../../services/friendService' // We might need a specific 'getFriendsOfUser' not just 'getFriends' (which is usually for 'me')
import { Loader2, UserX } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// We need to implement a way to get *another user's* friends.
// Existing friendService.getFriends() uses supabase.auth.user() -> "my friends"
// We should check friendService to see if it supports a userId arg.
// If not, I'll update friendService in a moment. Assuming I will update it.

export default function ProfileFriends({ userId }) {
    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFriends = async () => {
            setLoading(true)
            try {
                // Assuming we update friendService to accept userId, or we do a direct query here
                // Let's do a direct query here for speed if service isn't ready
                // Actually, cleaner to put in service. I'll add `getUserFriends(userId)` to service next.
                // For now, I'll assume the method exists.
                const friendData = await friendService.getUserFriends(userId)
                setFriends(friendData)
            } catch (error) {
                console.error('Error fetching friends:', error)
            } finally {
                setLoading(false)
            }
        }
        if (userId) fetchFriends()
    }, [userId])

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-ttu-blue" />
            </div>
        )
    }

    if (friends.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <UserX className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No friends yet</h3>
                <p className="text-slate-500">When this user adds friends, they'll appear here.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="font-bold text-slate-900">Friends ({friends.length})</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {friends.map(friend => (
                    <Link to={`/profile/${friend.id}`} key={friend.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                        <img
                            src={friend.avatar_url || `https://ui-avatars.com/api/?name=${friend.full_name}&background=random`}
                            alt={friend.full_name}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                            <h4 className="font-semibold text-slate-900">{friend.full_name}</h4>
                            <p className="text-xs text-slate-500">{friend.department || 'Student'}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
