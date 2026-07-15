import { supabase } from '../lib/supabase'

export const notificationService = {
    // Fetch notifications for the current user
    async getNotifications() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not found')

        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                sender:profiles!sender_id(*),
                post:posts!post_id(*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error

        return data.map(n => ({
            ...n,
            actor: n.sender,
            entity: n.post
        }))
    },

    // Create a notification
    async createNotification({ userId, type, content, referenceId, senderId }) {
        // If referenceId is likely a post ID (for like/comment types), store it in post_id too
        const isPostRelated = ['like', 'comment', 'post_approved', 'post_rejected', 'post_like', 'post_comment'].includes(type)

        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                content,
                reference_id: referenceId,
                sender_id: senderId,
                post_id: isPostRelated ? referenceId : null
            })
        if (error) throw error
    },

    // Mark specific notification as read
    async markAsRead(id) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (error) throw error
    },

    // Mark all as read
    async markAllAsRead() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        if (error) throw error
    },

    // Get unread count
    async getUnreadCount() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return 0

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        if (error) throw error
        return count
    }
}
