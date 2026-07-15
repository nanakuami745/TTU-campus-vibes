import { supabase } from '../lib/supabase'

export const courseGroupService = {
    async getAllGroups() {
        const { data, error } = await supabase
            .from('course_groups')
            .select(`*, course:courses(*), members:course_group_members(count)`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Groups relevant to the student's own department/level courses, first
    async getRecommendedGroups() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: profile } = await supabase
            .from('profiles')
            .select('department, level')
            .eq('id', user.id)
            .single()

        const { data, error } = await supabase
            .from('course_groups')
            .select(`*, course:courses(*), members:course_group_members(count)`)
            .order('created_at', { ascending: false })

        if (error) throw error

        const matches = data.filter(g => g.course?.department === profile?.department && g.course?.level === profile?.level)
        const rest = data.filter(g => !(g.course?.department === profile?.department && g.course?.level === profile?.level))
        return [...matches, ...rest]
    },

    async getGroup(groupId) {
        const { data, error } = await supabase
            .from('course_groups')
            .select(`*, course:courses(*), members:course_group_members(count)`)
            .eq('id', groupId)
            .single()

        if (error) throw error
        return data
    },

    async isMember(groupId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { data } = await supabase
            .from('course_group_members')
            .select('id')
            .eq('group_id', groupId)
            .eq('user_id', user.id)
            .maybeSingle()

        return !!data
    },

    async joinGroup(groupId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('course_group_members')
            .insert({ group_id: groupId, user_id: user.id })

        if (error) throw error
    },

    async leaveGroup(groupId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('course_group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', user.id)

        if (error) throw error
    },

    // Courses the current user can create a group for (their rep courses, or all courses if admin)
    async getMyCreatableCourses() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role === 'admin') {
            const { data, error } = await supabase.from('courses').select('*').order('code')
            if (error) throw error
            return data
        }

        const { data, error } = await supabase
            .from('class_reps')
            .select('course:courses(*)')
            .eq('user_id', user.id)

        if (error) throw error
        return data.map(r => r.course)
    },

    async createGroup({ course_id, name, description }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('course_groups')
            .insert({ course_id, name, description: description || null, created_by: user.id })
            .select(`*, course:courses(*)`)
            .single()

        if (error) throw error

        // Creator auto-joins their own group
        await supabase.from('course_group_members').insert({ group_id: data.id, user_id: user.id })

        return data
    },

    async updatePinnedAnnouncement(groupId, pinned_announcement) {
        const { data, error } = await supabase
            .from('course_groups')
            .update({ pinned_announcement })
            .eq('id', groupId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteGroup(groupId) {
        const { error } = await supabase
            .from('course_groups')
            .delete()
            .eq('id', groupId)

        if (error) throw error
    }
}
