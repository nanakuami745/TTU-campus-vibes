import { supabase } from '../lib/supabase'

export const profileService = {
    // Get Profile by ID
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                posts:posts(count),
                friends_received:friendships!receiver_id(count),
                friends_requested:friendships!requester_id(count)
            `)
            .eq('id', userId)
            .single()

        if (error) throw error

        // Calculate total friends (rough estimate for now)
        // Ideally we filter by status='accepted' but count is simple here
        // We can do a separate query for accurate friend count if needed
        return data
    },

    // Get Friend Count (Accurate)
    async getFriendCount(userId) {
        const { count, error } = await supabase
            .from('friendships')
            .select('*', { count: 'exact', head: true })
            .or(`and(requester_id.eq.${userId},status.eq.accepted),and(receiver_id.eq.${userId},status.eq.accepted)`)

        if (error) throw error
        return count
    },

    // Update Profile Details
    async updateProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Upload Avatar
    async uploadAvatar(userId, file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/avatar-${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)

        // Update profile with new URL
        await this.updateProfile(userId, { avatar_url: publicUrl })

        return publicUrl
    },

    // Upload Cover Photo
    async uploadCover(userId, file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/cover-${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('covers') // Assuming bucket exists, or use 'post-media' or generic 'images'
            .upload(fileName, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('covers')
            .getPublicUrl(fileName)

        // Update profile with new URL
        await this.updateProfile(userId, { cover_url: publicUrl })

        return publicUrl
    }
}
