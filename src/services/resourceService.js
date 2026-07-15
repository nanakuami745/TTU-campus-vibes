import { supabase } from '../lib/supabase'

export const resourceService = {
    async getResourcesForCourse(courseId) {
        const { data, error } = await supabase
            .from('academic_resources')
            .select(`*, uploader:profiles(*)`)
            .eq('course_id', courseId)
            .order('upvote_count', { ascending: false })

        if (error) throw error
        return data
    },

    // Resources matched to the student's own department/level courses first
    async getRecommendedResources() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: profile } = await supabase
            .from('profiles')
            .select('department, level')
            .eq('id', user.id)
            .single()

        const { data, error } = await supabase
            .from('academic_resources')
            .select(`*, uploader:profiles(*), course:courses(*)`)
            .order('upvote_count', { ascending: false })

        if (error) throw error

        const matches = data.filter(
            r => r.course?.department === profile?.department && r.course?.level === profile?.level
        )
        const rest = data.filter(
            r => !(r.course?.department === profile?.department && r.course?.level === profile?.level)
        )

        return [...matches, ...rest]
    },

    async uploadResource({ course_id, resource_type, title, description, file, external_link }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        let file_url = null

        if (file) {
            const fileExt = file.name.split('.').pop()
            const filePath = `resources/${user.id}-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('post-media')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('post-media')
                .getPublicUrl(filePath)

            file_url = publicUrl
        }

        const { data, error } = await supabase
            .from('academic_resources')
            .insert({
                uploaded_by: user.id,
                course_id,
                resource_type,
                title,
                description,
                file_url,
                external_link: external_link || null
            })
            .select(`*, uploader:profiles(*)`)
            .single()

        if (error) throw error
        return data
    },

    async toggleUpvote(resourceId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: existing } = await supabase
            .from('resource_upvotes')
            .select('id')
            .eq('resource_id', resourceId)
            .eq('user_id', user.id)
            .maybeSingle()

        if (existing) {
            await supabase.from('resource_upvotes').delete().eq('id', existing.id)
            return { upvoted: false }
        } else {
            await supabase.from('resource_upvotes').insert({ resource_id: resourceId, user_id: user.id })
            return { upvoted: true }
        }
    },

    async hasUserUpvoted(resourceId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { data } = await supabase
            .from('resource_upvotes')
            .select('id')
            .eq('resource_id', resourceId)
            .eq('user_id', user.id)
            .maybeSingle()

        return !!data
    },

    async deleteResource(resourceId) {
        const { error } = await supabase
            .from('academic_resources')
            .delete()
            .eq('id', resourceId)

        if (error) throw error
    }
}
