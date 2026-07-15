import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { signIn, profile } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { data, error } = await signIn(email, password)
            if (error) throw error

            if (data.user) {
                // Check if user is admin
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                if (profile?.role === 'admin') {
                    navigate('/admin')
                } else {
                    navigate('/')
                }
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-ttu-blue px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border-t-4 border-ttu-gold">
                <div className="text-center">
                    <img 
                        src="/logo.png" 
                        alt="TTU Logo" 
                        className="mx-auto h-16 w-16 sm:h-20 sm:w-20 object-contain"
                    />
                    <span className="inline-flex items-center gap-1.5 bg-ttu-gold/15 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mt-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-ttu-gold" />
                        Verified TTU students only
                    </span>
                    <h2 className="mt-4 text-2xl sm:text-3xl font-display font-bold text-slate-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Sign in to Campus Vibes
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="student@ttu.edu.gh"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="relative mt-1">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-ttu-blue hover:text-blue-800">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign in
                        </Button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-ttu-blue hover:text-blue-800">
                            Register as Student
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
