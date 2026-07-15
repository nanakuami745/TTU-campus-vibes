import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000'

export const adminAccountService = {
    async createStudent({ full_name, email, index_number, department, level }) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')

        let response
        try {
            response = await fetch(`${API_URL}/admin/create-student`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ full_name, email, index_number, department, level })
            })
        } catch (networkError) {
            throw new Error(
                `Could not reach the account-creation server at ${API_URL}. Make sure server/index.js is deployed and running, and VITE_API_URL is set correctly.`
            )
        }

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.error || 'Failed to create student account')
        }

        return result
    }
}
