import React from 'react'
import StudentLayout from '../layouts/StudentLayout'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, GraduationCap } from 'lucide-react'

export default function DigitalID() {
    const { user, profile } = useAuth()

    // Prefer the student's real Index Number; fall back to the
    // email-derived value for accounts created before this field existed.
    const matNumber = profile?.index_number || (user?.email ? user.email.split('@')[0].toUpperCase() : '—')
    // Short verification code derived from the user's account id — not a
    // scannable QR, just a human-checkable code unique to this account.
    const verificationCode = user?.id ? user.id.replace(/-/g, '').slice(-10).toUpperCase() : '—'

    return (
        <StudentLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Digital Student ID</h1>
                    <p className="text-slate-500 mt-1">Your verified TTU identity, generated from your account.</p>
                </div>

                {/* ID Card */}
                <div className="max-w-md mx-auto">
                    <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-gradient-to-br from-ttu-blue to-blue-900 text-white">
                        <div className="p-5 flex items-center justify-between border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="TTU Crest" className="h-8 w-8 object-contain" />
                                <span className="font-bold tracking-wide text-sm">TAKORADI TECHNICAL UNIVERSITY</span>
                            </div>
                            <ShieldCheck className="h-6 w-6 text-green-400" />
                        </div>

                        <div className="p-6 flex gap-5 items-center">
                            <img
                                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'Student'}&background=random`}
                                alt={profile?.full_name}
                                className="h-24 w-24 rounded-2xl object-cover border-2 border-white/30"
                            />
                            <div className="min-w-0">
                                <p className="text-xs uppercase tracking-wider text-blue-200">Student</p>
                                <h2 className="text-xl font-bold leading-tight truncate">{profile?.full_name || 'Loading...'}</h2>
                                <p className="text-sm text-blue-100 mt-1">{profile?.department || 'Department not set'}</p>
                                <p className="text-sm text-blue-100">Level {profile?.level || '—'}</p>
                            </div>
                        </div>

                        <div className="px-6 pb-6 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-blue-200">Index Number</p>
                                <p className="font-mono font-semibold">{matNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-blue-200">Status</p>
                                <p className="font-semibold text-green-400">
                                    {profile?.is_active === false ? 'Inactive' : 'Active'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-black/20 px-6 py-3 flex items-center justify-between">
                            <span className="text-[10px] tracking-widest text-blue-200">VERIFICATION CODE</span>
                            <span className="font-mono text-xs tracking-widest">{verificationCode}</span>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 text-center mt-4">
                        This ID is generated from your verified {profile?.email ? profile.email.split('@')[1] : 'ttu.edu.gh'} account
                        and reflects live profile data. It is a supplementary digital identity, not a replacement for your
                        official university ID card.
                    </p>
                </div>
            </div>
        </StudentLayout>
    )
}
