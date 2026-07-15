
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
            } else {
                // Check if account is active
                if (data.is_active === false) {
                    await supabase.auth.signOut()
                    setUser(null)
                    setProfile(null)
                    alert('Your account has been deactivated by an administrator.')
                } else {
                    setProfile(data)
                }
            }
        } catch (error) {
            console.error('Error in fetchProfile:', error)
        } finally {
            setLoading(false)
        }
    }

    const signUp = async (email, password, metadata) => {
        return supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata, // full_name, etc.
            },
        })
    }

    const signIn = async (email, password) => {
        return supabase.auth.signInWithPassword({
            email,
            password,
        })
    }

    const signOut = async () => {
        return supabase.auth.signOut()
    }

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
