import React, { useState } from 'react'
import { adminAccountService } from '../../services/adminAccountService'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { isValidIndexNumber, normalizeIndexNumber } from '../../lib/validators'
import { UserPlus, Loader2, Copy, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function AdminAddStudent() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        index_number: '',
        department: '',
        level: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState(null)
    const [copied, setCopied] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.full_name.trim() || !formData.email.trim() || !formData.index_number.trim()) {
            setError('Full name, email, and Index Number are required.')
            return
        }
        if (!formData.email.trim().toLowerCase().endsWith('@ttu.edu.gh')) {
            setError('Only @ttu.edu.gh email addresses are allowed.')
            return
        }
        if (!isValidIndexNumber(formData.index_number)) {
            setError('Index Number must be in the format BC/HPM/202/23 or 0723000012.')
            return
        }

        setLoading(true)
        try {
            const res = await adminAccountService.createStudent({
                full_name: formData.full_name.trim(),
                email: formData.email.trim().toLowerCase(),
                index_number: normalizeIndexNumber(formData.index_number),
                department: formData.department.trim() || null,
                level: formData.level.trim() || null
            })
            setResult(res)
            setFormData({ full_name: '', email: '', index_number: '', department: '', level: '' })
        } catch (err) {
            setError(err.message || 'Failed to create account')
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(
            `TTU Campus Vibes login\nEmail: ${result.user.email}\nTemporary password: ${result.temporary_password}\n\nPlease log in and set your own password from Profile settings.`
        )
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-lg">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Add Student Account</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Create a verified account directly. The student gets a temporary password to log in and change immediately.
                </p>
            </div>

            {result ? (
                <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="h-5 w-5" />
                        <h2 className="font-bold">Account created</h2>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                        <p><span className="text-slate-500">Name:</span> <span className="font-medium">{result.user.full_name}</span></p>
                        <p><span className="text-slate-500">Email:</span> <span className="font-medium">{result.user.email}</span></p>
                        <p><span className="text-slate-500">Temporary Password:</span> <span className="font-mono font-bold text-ttu-blue">{result.temporary_password}</span></p>
                    </div>
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        This password is shown once. Share it securely with the student — they should log in and set their own password from Profile settings right away.
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleCopy} variant="secondary" className="gap-2 flex-1">
                            <Copy className="h-4 w-4" /> {copied ? 'Copied!' : 'Copy Details'}
                        </Button>
                        <Button onClick={() => setResult(null)} className="flex-1">Add Another</Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                    <Input name="full_name" placeholder="Full name" value={formData.full_name} onChange={handleChange} />
                    <Input name="email" type="email" placeholder="student@ttu.edu.gh" value={formData.email} onChange={handleChange} />
                    <Input name="index_number" placeholder="Index Number (BC/HPM/202/23 or 0723000012)" value={formData.index_number} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="department" placeholder="Department (optional)" value={formData.department} onChange={handleChange} />
                        <Input name="level" placeholder="Level (optional)" value={formData.level} onChange={handleChange} />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full gap-2">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" /> Create Account</>}
                    </Button>
                </form>
            )}
        </div>
    )
}
