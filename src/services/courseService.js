import { supabase } from '../lib/supabase'

export const courseService = {
    // Get all courses, optionally filtered by search term (code or name)
    async getCourses(searchTerm = '') {
        let query = supabase
            .from('courses')
            .select('*')
            .order('code', { ascending: true })

        if (searchTerm) {
            query = query.or(`code.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        }

        const { data, error } = await query
        if (error) throw error
        return data
    },

    // Get courses relevant to the current student's department/level first
    async getRecommendedCourses() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: profile } = await supabase
            .from('profiles')
            .select('department, level')
            .eq('id', user.id)
            .single()

        const { data: allCourses, error } = await supabase
            .from('courses')
            .select('*')
            .order('code', { ascending: true })

        if (error) throw error

        // Simple rule-based "recommendation": courses matching the
        // student's own department/level are surfaced first.
        const matches = allCourses.filter(
            c => c.department === profile?.department && c.level === profile?.level
        )
        const rest = allCourses.filter(
            c => !(c.department === profile?.department && c.level === profile?.level)
        )

        return [...matches, ...rest]
    },

    // Admin: create a course
    async createCourse({ code, name, department, level, lecturer_name }) {
        const { data, error } = await supabase
            .from('courses')
            .insert({ code, name, department, level, lecturer_name })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Admin: remove a course
    async deleteCourse(courseId) {
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseId)

        if (error) throw error
    }
}
