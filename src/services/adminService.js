import { supabase } from '../lib/supabase'
import { notificationService } from './notificationService'

export const adminService = {
    // Dashboard Stats
    async getStats() {
        // Parallel fetching for performance
        const [
            { count: totalStudents, error: studentsError },
            { count: totalPosts, error: postsError },
            { count: pendingPosts, error: pendingError }
        ] = await Promise.all([
            // Total Students
            supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
            // Total Posts
            supabase.from('posts').select('*', { count: 'exact', head: true }),
            // Pending Posts
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ])

        if (studentsError) throw studentsError
        if (postsError) throw postsError
        if (pendingError) throw pendingError

        return {
            totalStudents,
            totalPosts,
            pendingPosts
        }
    },

    // Moderation: Get Pending Posts
    async getPendingPosts() {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:profiles(*)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Moderation: Approve Post
    async approvePost(postId) {
        const { data, error } = await supabase
            .from('posts')
            .update({ status: 'approved' })
            .eq('id', postId)
            .select()
            .single()

        if (error) throw error

        try {
            const { data: { user } } = await supabase.auth.getUser()
            await notificationService.createNotification({
                userId: data.author_id,
                type: 'post_approved',
                content: 'Your post was approved and is now public',
                referenceId: data.id,
                senderId: user.id
            })
        } catch (notifError) {
            console.error('Failed to create approval notification', notifError)
        }

        return data
    },

    // Moderation: Reject Post
    async rejectPost(postId) {
        const { data, error } = await supabase
            .from('posts')
            .update({ status: 'rejected' })
            .eq('id', postId)
            .select()
            .single()

        if (error) throw error

        try {
            const { data: { user } } = await supabase.auth.getUser()
            await notificationService.createNotification({
                userId: data.author_id,
                type: 'post_rejected',
                content: 'Your post was rejected by an admin and is no longer visible',
                referenceId: data.id,
                senderId: user.id
            })
        } catch (notifError) {
            console.error('Failed to create rejection notification', notifError)
        }

        return data
    },

    // User Management: List Users
    async getUsers(searchTerm = '') {
        let query = supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        // Apply search if provided
        if (searchTerm) {
            query = query.ilike('full_name', `%${searchTerm}%`)
        }

        const { data, error } = await query

        if (error) throw error
        return data
    },

    // User Management: Deactivate/Reactivate
    async updateUserStatus(userId, isActive) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ is_active: isActive })
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    }
}
