import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShieldAlert, Users, LogOut, Bell, Megaphone, Briefcase, MessageSquareText, UserCog, BookOpen, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
    const { signOut, profile } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const adminLinks = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: ShieldAlert, label: 'Moderation', path: '/admin/moderation' },
        { icon: Users, label: 'User Management', path: '/admin/users' },
        { icon: UserPlus, label: 'Add Student', path: '/admin/add-student' },
        { icon: Megaphone, label: 'Broadcast', path: '/admin/broadcast' },
        { icon: Briefcase, label: 'Job Listings', path: '/admin/jobs' },
        { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
        { icon: MessageSquareText, label: 'Feedback Moderation', path: '/admin/feedback' },
        { icon: UserCog, label: 'Class Reps', path: '/admin/class-reps' },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white z-50 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-ttu-gold font-bold text-xl">
                        <ShieldAlert className="h-8 w-8" />
                        <span>TTU Admin</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {adminLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-ttu-blue text-white shadow-lg shadow-blue-900/50'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <link.icon className="h-5 w-5" />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-800 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=random`}
                                alt="Admin"
                                className="h-10 w-10 rounded-full border-2 border-slate-700"
                            />
                            <div className="overflow-hidden">
                                <h4 className="font-bold text-sm truncate">{profile?.full_name}</h4>
                                <p className="text-xs text-slate-400">Administrator</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                {/* Mobile Header */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:hidden sticky top-0 z-40">
                    <div className="font-bold text-slate-900">Admin Panel</div>
                    <button className="p-2">Menu</button>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
