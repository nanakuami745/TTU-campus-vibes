import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { isValidIndexNumber, normalizeIndexNumber } from '../lib/validators'

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        indexNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const validateEmail = (email) => {
        return email.endsWith('@ttu.edu.gh')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.indexNumber.trim()) {
            return setError('Index Number is required.')
        }

        if (!isValidIndexNumber(formData.indexNumber)) {
            return setError('Index Number must be in the format BC/HPM/202/23 or 0723000012.')
        }

        if (!validateEmail(formData.email)) {
            return setError('Only @ttu.edu.gh email addresses are allowed.')
        }

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match.')
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters.')
        }

        setLoading(true)

        try {
            const { data, error } = await signUp(formData.email, formData.password, {
                full_name: formData.fullName,
                index_number: normalizeIndexNumber(formData.indexNumber)
            })

            if (error) throw error

            // Successful signup
            navigate('/')
        } catch (err) {
            if (err.message?.includes('index_number') || err.message?.includes('profiles_index_number_unique')) {
                setError('This Index Number is already registered to another account.')
            } else {
                setError(err.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-ttu-blue px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border-t-4 border-ttu-gold">
                <div className="flex items-center">
                    <Link to="/login" className="text-slate-400 hover:text-slate-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </div>
                <div className="text-center">
                    <img 
                        src="/logo.png" 
                        alt="TTU Logo" 
                        className="mx-auto h-16 w-16 sm:h-20 sm:w-20 object-contain"
                    />
                    <h2 className="mt-4 text-2xl sm:text-3xl font-display font-bold text-slate-900">
                        Create account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Join Campus Vibes
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                                Full Name
                            </label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="indexNumber" className="block text-sm font-medium text-slate-700">
                                Index Number
                            </label>
                            <Input
                                id="indexNumber"
                                name="indexNumber"
                                type="text"
                                required
                                placeholder="BC/HPM/202/23 or 0723000012"
                                value={formData.indexNumber}
                                onChange={handleChange}
                                className="mt-1"
                            />
                            <p className="text-xs text-slate-500 mt-1">Format: BC/HPM/202/23 or 0723000012</p>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Student Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="index@ttu.edu.gh"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1"
                            />
                            <p className="text-xs text-slate-500 mt-1">Must be a valid @ttu.edu.gh email</p>
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
                                    autoComplete="new-password"
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
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
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                Confirm Password
                            </label>
                            <div className="relative mt-1">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
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
                            Register
                        </Button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-ttu-blue hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
