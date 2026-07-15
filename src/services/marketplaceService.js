import { supabase } from '../lib/supabase'

export const marketplaceService = {
    async getListings({ category = null, listing_type = null, search = '' } = {}) {
        let query = supabase
            .from('marketplace_items')
            .select(`*, seller:profiles(*)`)
            .eq('status', 'active')
            .order('created_at', { ascending: false })

        if (category) query = query.eq('category', category)
        if (listing_type) query = query.eq('listing_type', listing_type)
        if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    async getMyListings() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('marketplace_items')
            .select('*')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async createListing({ title, description, category, listing_type, price, file }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        let image_url = null

        if (file) {
            const fileExt = file.name.split('.').pop()
            const filePath = `marketplace/${user.id}-${Date.now()}.${fileExt}`

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
            .from('marketplace_items')
            .insert({
                seller_id: user.id,
                title,
                description,
                category,
                listing_type,
                price: price || null,
                image_url
            })
            .select(`*, seller:profiles(*)`)
            .single()

        if (error) throw error
        return data
    },

    async updateStatus(listingId, status) {
        const { data, error } = await supabase
            .from('marketplace_items')
            .update({ status })
            .eq('id', listingId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteListing(listingId) {
        const { error } = await supabase
            .from('marketplace_items')
            .delete()
            .eq('id', listingId)

        if (error) throw error
    }
}
