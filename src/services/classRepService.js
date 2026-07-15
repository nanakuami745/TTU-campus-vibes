import { supabase } from '../lib/supabase'

export const classRepService = {
    async getAllReps() {
        const { data, error } = await supabase
            .from('class_reps')
            .select(`*, user:profiles!class_reps_user_id_fkey(*), course:courses(*)`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Courses the current user has been assigned as rep for
    async getMyRepCourses() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('class_reps')
            .select(`*, course:courses(*)`)
            .eq('user_id', user.id)

        if (error) throw error
        return data.map(r => r.course)
    },

    // Admin: search students by name/email to assign as rep
    async searchStudents(term) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'student')
            .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
            .limit(10)

        if (error) throw error
        return data
    },

    async assignRep({ user_id, course_id }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('class_reps')
            .insert({ user_id, course_id, assigned_by: user.id })
            .select(`*, user:profiles!class_reps_user_id_fkey(*), course:courses(*)`)
            .single()

        if (error) throw error
        return data
    },

    async removeRep(repId) {
        const { error } = await supabase
            .from('class_reps')
            .delete()
            .eq('id', repId)

        if (error) throw error
    }
}
