import React from 'react'
import { User, Mail, MapPin, Calendar, BookOpen, GraduationCap } from 'lucide-react'
import { format } from 'date-fns'

export default function ProfileAbout({ profile }) {
    if (!profile) return null

    const details = [
        { icon: User, label: 'Full Name', value: profile.full_name },
        { icon: Mail, label: 'Email', value: profile.email || 'Hidden' }, // Assuming email might be available or generic
        { icon: GraduationCap, label: 'Department', value: profile.department || 'Not specified' },
        { icon: BookOpen, label: 'Level', value: profile.level ? `Level ${profile.level}` : 'Not specified' },
        { icon: Calendar, label: 'Joined', value: profile.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'Unknown' },
    ]

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">About Info</h3>
            </div>

            <div className="p-6">
                {profile.bio && (
                    <div className="mb-8">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 uppercase tracking-wide">Bio</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {profile.bio}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    {details.map((item) => (
                        <div key={item.label} className="flex items-start gap-3">
                            <div className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{item.label}</p>
                                <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
