import { supabase } from '../lib/supabase'

export const jobService = {
    async getListings({ listing_type = null } = {}) {
        let query = supabase
            .from('job_listings')
            .select('*')
            .order('created_at', { ascending: false })

        if (listing_type) query = query.eq('listing_type', listing_type)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    // Admin-only (enforced by RLS as well)
    async createListing({ title, company_name, listing_type, description, apply_info, deadline }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('job_listings')
            .insert({
                posted_by: user.id,
                title,
                company_name,
                listing_type,
                description,
                apply_info,
                deadline: deadline || null
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteListing(listingId) {
        const { error } = await supabase
            .from('job_listings')
            .delete()
            .eq('id', listingId)

        if (error) throw error
    }
}
