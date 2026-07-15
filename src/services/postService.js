import { supabase } from '../lib/supabase'
import { notificationService } from './notificationService'

export const postService = {
    // Fetch Feed Posts
    async getFeed() {
        // TODO: Advanced filtering for 'friends' visibility
        // For now, getting all 'approved' posts and own posts (including pending)

        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:profiles(*),
                likes:likes(count),
                comments:comments(count)
            `)
            .is('course_group_id', null)
            .or(`status.eq.approved,and(author_id.eq.${user.id},status.neq.rejected)`) // Approved posts, OR my own posts that aren't rejected
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Fetch posts for a specific course group discussion
    async getCourseGroupPosts(groupId) {
        const { data, error } = await supabase
            .from('posts')
            .select(`*, author:profiles(*), likes:likes(count), comments:comments(count)`)
            .eq('course_group_id', groupId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Delete a post (author or admin)
    async deletePost(postId) {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId)

        if (error) throw error
    },

    // Create New Post
    async createPost({ content, file, visibility = 'public', feeling = null, is_urgent = false, course_group_id = null }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch user profile to check role for auto-approval
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const isAdmin = profile?.role === 'admin'

        // Status Logic:
        // - Admin: Always 'approved'
        // - Friends Only: Always 'approved' (no moderation needed usually)
        // - Public (Student): 'pending' (needs approval)
        // - Course group posts: Always 'approved' (membership is already enforced by the database trigger)
        let status = 'approved'
        if (visibility === 'public' && !isAdmin && !course_group_id) {
            status = 'pending'
        }

        let media_url = null
        let media_type = null

        // Upload Image if exists
        if (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('post-media')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('post-media')
                .getPublicUrl(filePath)

            media_url = publicUrl
            media_type = file.type.startsWith('video/') ? 'video' : 'image'
        }

        // Insert Post
        const { data, error } = await supabase
            .from('posts')
            .insert({
                author_id: user.id,
                content,
                media_url,
                media_type,
                visibility,
                feeling: feeling, // Store feeling object (jsonb)
                status,
                is_urgent,
                course_group_id
            })
            .select(`*, author:profiles(*)`)
        if (error) throw error
        return data
    },

    // Get Posts by User
    async getPostsByUser(userId) {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:profiles!author_id(*),
                likes(user_id),
                comments(count)
            `)
            .eq('author_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return data.map(post => ({
            ...post,
            likes: post.likes.map(like => like.user_id),
            _count: {
                likes: post.likes.length,
                comments: post.comments[0].count
            }
        }))
    },

    async toggleLike(postId, userId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Get post author to notify
        const { data: post } = await supabase
            .from('posts')
            .select('author_id')
            .eq('id', postId)
            .single()

        // Check if like exists
        const { data: existingLike } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single()

        if (existingLike) {
            // Unlike
            await supabase.from('likes').delete().eq('id', existingLike.id)
            return { liked: false }
        } else {
            // Like
            await supabase.from('likes').insert({ post_id: postId, user_id: user.id })

            // Notify author if not self
            if (post && post.author_id !== user.id) {
                try {
                    await notificationService.createNotification({
                        userId: post.author_id,
                        type: 'like',
                        content: 'liked your post',
                        referenceId: postId,
                        senderId: user.id
                    })
                } catch (notifError) {
                    console.error('Failed to create notification', notifError)
                }
            }

            return { liked: true }
        }
    },

    // Check if User Liked Post
    async hasUserLiked(postId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { data } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle()

        return !!data
    },

    // Get Comments
    async getComments(postId) {
        const { data, error } = await supabase
            .from('comments')
            .select(`
        *,
        author:profiles(*)
      `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data
    },

    // Add Comment
    async addComment(postId, content) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Get post author
        const { data: post } = await supabase
            .from('posts')
            .select('author_id')
            .eq('id', postId)
            .single()

        const { data, error } = await supabase
            .from('comments')
            .insert({
                post_id: postId,
                author_id: user.id,
                content
            })
            .select(`*, author:profiles(*)`)
            .single()

        if (error) throw error

        // Notify author if not self
        if (post && post.author_id !== user.id) {
            try {
                await notificationService.createNotification({
                    userId: post.author_id,
                    type: 'comment',
                    content: 'commented on your post',
                    referenceId: postId,
                    senderId: user.id
                })
            } catch (notifError) {
                console.error('Failed to create notification', notifError)
            }
        }

        return data
    }
}
