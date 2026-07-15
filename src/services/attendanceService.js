import { supabase } from '../lib/supabase'

const SESSION_DURATION_MINUTES = 30
const DEFAULT_RADIUS_METERS = 150

// Wraps the browser Geolocation API in a promise with a friendly error.
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Your browser does not support location services.'))
            return
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    reject(new Error('Location permission was denied. You must allow location access to check in.'))
                } else {
                    reject(new Error('Could not determine your location. Please try again.'))
                }
            },
            { enableHighAccuracy: true, timeout: 15000 }
        )
    })
}

export const attendanceService = {
    async startSession(courseId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { lat, lng } = await getCurrentPosition()

        const expiresAt = new Date(Date.now() + SESSION_DURATION_MINUTES * 60 * 1000).toISOString()

        const { data, error } = await supabase
            .from('attendance_sessions')
            .insert({
                course_id: courseId,
                rep_id: user.id,
                venue_lat: lat,
                venue_lng: lng,
                radius_meters: DEFAULT_RADIUS_METERS,
                expires_at: expiresAt
            })
            .select(`*, course:courses(*)`)
            .single()

        if (error) throw error
        return data
    },

    async endSession(sessionId) {
        const { data, error } = await supabase
            .from('attendance_sessions')
            .update({ ended_at: new Date().toISOString() })
            .eq('id', sessionId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async getSession(sessionId) {
        const { data, error } = await supabase
            .from('attendance_sessions')
            .select(`*, course:courses(*), rep:profiles(*)`)
            .eq('id', sessionId)
            .single()

        if (error) throw error
        return data
    },

    async getSessionCheckins(sessionId) {
        const { data, error } = await supabase
            .from('attendance_checkins')
            .select(`*, student:profiles(*)`)
            .eq('session_id', sessionId)
            .order('checked_in_at', { ascending: true })

        if (error) throw error
        return data
    },

    // Attempts to check the current user in. Location is captured here and
    // sent to the database, but the actual distance/expiry validation is
    // enforced server-side (see docs/sql/attendance-migration.sql) — this
    // call can fail even if it reaches the server, and that's by design.
    async checkIn(sessionId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { lat, lng } = await getCurrentPosition()

        const { data, error } = await supabase
            .from('attendance_checkins')
            .insert({
                session_id: sessionId,
                student_id: user.id,
                student_lat: lat,
                student_lng: lng
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                throw new Error("You've already checked in to this session.")
            }
            // Surface the database's own validation message (expired, too far, etc.)
            throw new Error(error.message.replace(/^.*?:\s*/, ''))
        }
        return data
    },

    async getMyCheckins() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('attendance_checkins')
            .select(`*, session:attendance_sessions(*, course:courses(*))`)
            .eq('student_id', user.id)
            .order('checked_in_at', { ascending: false })

        if (error) throw error
        return data
    }
}
