import { supabase } from '../lib/supabase'

export const lostFoundService = {
    // Get all items, optionally filtered by type ('lost' | 'found') and status
    async getItems({ type = null, status = 'open' } = {}) {
        let query = supabase
            .from('lost_found_items')
            .select(`*, reporter:profiles(*)`)
            .order('created_at', { ascending: false })

        if (type) query = query.eq('item_type', type)
        if (status) query = query.eq('status', status)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    async reportItem({ item_type, item_name, description, location, contact_info, file }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        let image_url = null

        if (file) {
            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('post-media')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('post-media')
                .getPublicUrl(filePath)

            image_url = publicUrl
        }

        const { data, error } = await supabase
            .from('lost_found_items')
            .insert({
                reporter_id: user.id,
                item_type,
                item_name,
                description,
                location,
                contact_info,
                image_url
            })
            .select(`*, reporter:profiles(*)`)
            .single()

        if (error) throw error
        return data
    },

    async markResolved(itemId) {
        const { data, error } = await supabase
            .from('lost_found_items')
            .update({ status: 'resolved' })
            .eq('id', itemId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteItem(itemId) {
        const { error } = await supabase
            .from('lost_found_items')
            .delete()
            .eq('id', itemId)

        if (error) throw error
    }
}
