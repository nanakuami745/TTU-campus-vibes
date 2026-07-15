import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password',
            })
            if (error) throw error
            setMessage('Check your email for the password reset link.')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div className="flex items-center">
                    <Link to="/login" className="text-slate-400 hover:text-slate-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </div>
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Enter your email to receive recovery instructions
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
                            {message}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Send Reset Link
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
