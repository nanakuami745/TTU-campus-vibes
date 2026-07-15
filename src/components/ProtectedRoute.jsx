import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children, roleRequired }) {
    const { user, profile, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-ttu-blue" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (roleRequired && profile?.role !== roleRequired) {
        // If waiting for profile or role mismatch
        if (!profile) return <div>Loading profile...</div> // Or handle edge case
        return <Navigate to="/" replace /> // Or unauthorized page
    }

    return children
}
