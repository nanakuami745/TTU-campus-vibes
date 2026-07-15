import { supabase } from '../lib/supabase'
import { notificationService } from './notificationService'

export const friendService = {
    // Search Users (excluding self)
    async searchUsers(query) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!query) return []

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('full_name', `%${query}%`)
            .neq('id', user.id) // Exclude self
            .limit(10)

        if (error) throw error
        return data
    },

    // Get Friendship Status between current user and target user
    async getFriendshipStatus(targetUserId) {
        const { data: { user } } = await supabase.auth.getUser()

        const { data } = await supabase
            .from('friendships')
            .select('*')
            .or(`and(requester_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
            .maybeSingle()

        if (!data) return 'none'

        if (data.status === 'accepted') return 'friends'
        if (data.requester_id === user.id) return 'sent'
        if (data.receiver_id === user.id) return 'received'

        return 'none'
    },

    // Send Friend Request
    async sendRequest(targetUserId) {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('friendships')
            .insert({
                requester_id: user.id,
                receiver_id: targetUserId,
                status: 'pending'
            })
            .select()
            .single()

        if (error) throw error

        // Create Notification
        try {
            await notificationService.createNotification({
                userId: targetUserId,
                type: 'friend_request',
                content: 'sent you a friend request',
                referenceId: user.id, // Reference the sender profile or friendship
                senderId: user.id
            })
        } catch (notifError) {
            console.error('Failed to create notification', notifError)
        }

        return data
    },

    // Accept/Reject Request
    async respondToRequest(friendshipId, status) { // status: 'accepted' or 'rejected'
        // If rejected, maybe just delete the row? Or keep as rejected. standard is delete usually for 'decline' or 'cancel'.
        // Let's assume 'accepted' updates, 'rejected' deletes for simplicity in this MVP, or we can update to rejected.
        // Let's update to 'accepted'.

        if (status === 'rejected') {
            const { error } = await supabase
                .from('friendships')
                .delete()
                .eq('id', friendshipId)
            if (error) throw error
            return null
        }

        const { data, error } = await supabase
            .from('friendships')
            .update({ status: 'accepted' })
            .eq('id', friendshipId)
            .select()
            .single()

        if (error) throw error

        // If accepted, notify the requester
        if (status === 'accepted') {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                await notificationService.createNotification({
                    userId: data.requester_id,
                    type: 'friend_accept',
                    content: 'accepted your friend request',
                    referenceId: user.id,
                    senderId: user.id
                })
            } catch (notifError) {
                console.error('Failed to create notification', notifError)
            }
        }

        return data
    },

    // Get friends for a specific user (or current user if userId not provided)
    // Note: The RLS policies must allow reading friends of others (usually 'public' or authenticated users)
    async getUserFriends(userId) {
        // If no userId provided, it might default to current user via RLS or logic, 
        // but explicit query is safer for specific profiles.

        // This query assumes we look for confirmed friendships where user is either requester or recipient
        // We need to join with profiles to get details.

        const { data: { user } } = await supabase.auth.getUser()
        const targetId = userId || user?.id

        if (!targetId) return []

        const { data, error } = await supabase
            .from('friendships')
            .select(`
                id,
                requester:profiles!requester_id(*),
                receiver:profiles!receiver_id(*)
            `)
            .or(`requester_id.eq.${targetId},receiver_id.eq.${targetId}`)
            .eq('status', 'accepted')

        if (error) throw error

        // Transform to return just the *other* person's profile
        return data.map(f =>
            f.requester.id === targetId ? f.receiver : f.requester
        )
    },

    // Get Pending Requests (Received)
    async getPendingRequests() {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('friendships')
            .select(`
        *,
        requester:profiles!requester_id(*)
      `)
            .eq('receiver_id', user.id)
            .eq('status', 'pending')

        if (error) throw error
        return data
    },

    // Get My Friends
    async getFriends() {
        return this.getUserFriends()
    },

    // "People you may know" — students in the same department, excluding
    // yourself, existing friends, and anyone with a pending request either way.
    async getSuggestedFriends(limit = 6) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: myProfile } = await supabase
            .from('profiles')
            .select('department')
            .eq('id', user.id)
            .single()

        if (!myProfile?.department) return []

        // Everyone this user already has any relationship with (friend, sent, or received)
        const { data: existingLinks } = await supabase
            .from('friendships')
            .select('requester_id, receiver_id')
            .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

        const excludeIds = new Set([user.id])
        existingLinks?.forEach(link => {
            excludeIds.add(link.requester_id)
            excludeIds.add(link.receiver_id)
        })

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('department', myProfile.department)
            .eq('role', 'student')
            .not('id', 'in', `(${Array.from(excludeIds).join(',')})`)
            .limit(limit)

        if (error) throw error
        return data
    }
}
