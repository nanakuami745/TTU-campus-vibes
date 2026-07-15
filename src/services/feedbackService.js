import { supabase } from '../lib/supabase'

// NOTE: Feedback submissions never include a user/student reference.
// This is intentional (true anonymity) — see docs/DIFFERENTIATION.md.
// Do not add a submitted_by / user_id field to this service without
// also revisiting the anonymity guarantee described there.
export const feedbackService = {
    async getFeedbackForCourse(courseId) {
        const { data, error } = await supabase
            .from('course_feedback')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async getAggregateForCourse(courseId) {
        const { data, error } = await supabase
            .from('course_feedback')
            .select('rating')
            .eq('course_id', courseId)

        if (error) throw error

        if (!data.length) return { average: null, count: 0 }

        const average = data.reduce((sum, f) => sum + f.rating, 0) / data.length
        return { average: Math.round(average * 10) / 10, count: data.length }
    },

    async submitFeedback({ course_id, rating, comment }) {
        // Intentionally does not touch supabase.auth.getUser() for identity —
        // only used implicitly by RLS to confirm the caller is authenticated.
        const { data, error } = await supabase
            .from('course_feedback')
            .insert({ course_id, rating, comment })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Admin moderation: remove an abusive/inappropriate entry
    async deleteFeedback(feedbackId) {
        const { error } = await supabase
            .from('course_feedback')
            .delete()
            .eq('id', feedbackId)

        if (error) throw error
    }
}
