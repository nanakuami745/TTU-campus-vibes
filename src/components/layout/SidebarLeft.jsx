import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Newspaper, Users, MessageCircle, Bell, IdCard, Search, Briefcase, MessageSquareText, BookOpen, QrCode, ShoppingBag, Users2 } from 'lucide-react'
import { friendService } from '../../services/friendService'

export default function SidebarLeft() {
    const { profile } = useAuth()
    const location = useLocation()
    const [friendCount, setFriendCount] = useState(0)

    useEffect(() => {
        const fetchCount = async () => {
            if (profile) {
                try {
                    const friends = await friendService.getFriends()
                    setFriendCount(friends.length)
                } catch (e) {
                    console.error(e)
                }
            }
        }
        fetchCount()
    }, [profile])

    const isActive = (path) => location.pathname === path

    const navItems = [
        { icon: Newspaper, label: 'News Feed', path: '/', color: 'text-blue-500' },
        { icon: Users, label: 'Network', path: '/network', color: 'text-slate-600' },
        { icon: MessageCircle, label: 'Messages', path: '/messages', color: 'text-slate-600' },
        { icon: Bell, label: 'Notifications', path: '/notifications', color: 'text-slate-600' },
    ]

    const campusItems = [
        { icon: IdCard, label: 'Digital ID', path: '/digital-id', color: 'text-slate-600' },
        { icon: Search, label: 'Lost & Found', path: '/lost-found', color: 'text-slate-600' },
        { icon: Briefcase, label: 'Internships & Jobs', path: '/jobs', color: 'text-slate-600' },
        { icon: MessageSquareText, label: 'Course Feedback', path: '/course-feedback', color: 'text-slate-600' },
        { icon: BookOpen, label: 'Academic Resources', path: '/academic-resources', color: 'text-slate-600' },
        { icon: QrCode, label: 'Attendance', path: '/attendance', color: 'text-slate-600' },
        { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace', color: 'text-slate-600' },
        { icon: Users2, label: 'Course Groups', path: '/course-groups', color: 'text-slate-600' },
    ]

    return (
        <div className="hidden lg:block w-72 fixed left-0 top-16 bottom-0 p-6 overflow-y-auto no-scrollbar">
            {/* Mini Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-slate-100 flex flex-col items-center text-center">
                <div className="relative mb-3">
                    <div className="h-20 w-20 rounded-full p-1 bg-gradient-to-tr from-ttu-blue to-ttu-gold">
                        <img
                            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=random`}
                            alt="Profile"
                            className="h-full w-full rounded-full object-cover border-4 border-white"
                        />
                    </div>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900">{profile?.full_name || 'Student Name'}</h3>
                <p className="text-sm text-slate-500 mt-1">{profile?.department || 'Department'}</p>
                <p className="text-xs text-slate-400 mt-0.5">Year {profile?.level || '1'}</p>

                <div className="mt-4 flex gap-4 w-full border-t border-slate-100 pt-4">
                    <div className="flex-1 text-center">
                        <span className="block font-bold text-slate-900">{friendCount}</span>
                        <span className="text-xs text-slate-500">Friends</span>
                    </div>
                    <div className="flex-1 text-center border-l border-slate-100">
                        <span className="block font-bold text-slate-900">{/* Real course count later */} 0</span>
                        <span className="text-xs text-slate-500">Courses</span>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-3xl shadow-sm p-4 border border-slate-100 mb-6">
                <h4 className="font-bold text-slate-900 px-3 mb-2">Quick Links</h4>
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${isActive(item.path)
                                ? 'bg-ttu-gold/15 text-ttu-blue font-semibold'
                                : 'text-slate-600 hover:bg-slate-50 hover:pl-4'
                                }`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-ttu-blue' : item.color}`} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Campus Life */}
            <div className="bg-white rounded-3xl shadow-sm p-4 border border-slate-100">
                <h4 className="font-bold text-slate-900 px-3 mb-2">Campus Life</h4>
                <div className="space-y-1">
                    {campusItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${isActive(item.path)
                                ? 'bg-ttu-gold/15 text-ttu-blue font-semibold'
                                : 'text-slate-600 hover:bg-slate-50 hover:pl-4'
                                }`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-ttu-blue' : item.color}`} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
