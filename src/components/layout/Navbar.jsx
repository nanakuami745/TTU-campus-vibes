import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { supabase } from '../../lib/supabase'
import { Search, Home, Users, Bell, MessageCircle, LogOut, Menu, ChevronDown } from 'lucide-react'

export default function Navbar() {
    const { user, profile, signOut } = useAuth()
    const { unreadCount } = useNotification()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const location = useLocation()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [studentCount, setStudentCount] = useState(null)
    const dropdownRef = useRef(null)

    useEffect(() => {
        supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .then(({ count }) => setStudentCount(count))
    }, [])

    const isActive = (path) => location.pathname === path

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    const handleProfileClick = () => {
        setIsDropdownOpen(false)
    }

    const handleSignOut = async () => {
        setIsDropdownOpen(false)
        await signOut()
    }

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

                {/* Left: Logo & Search */}
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-2">
                        <img 
                            src="/logo.png" 
                            alt="TTU Logo" 
                            className="h-10 w-10 object-contain"
                        />
                        <span className="hidden md:block font-display font-bold text-xl text-ttu-blue tracking-tight">Campus Vibes</span>
                    </Link>

                    {studentCount !== null && (
                        <span className="hidden lg:inline-flex items-center gap-1.5 bg-ttu-gold/15 text-amber-800 text-xs font-bold pl-2 pr-3 py-1.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-ttu-gold" />
                            {studentCount.toLocaleString()} verified students
                        </span>
                    )}

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            if (searchQuery.trim()) {
                                navigate(`/network?q=${encodeURIComponent(searchQuery.trim())}`)
                            }
                        }}
                        className="hidden md:flex items-center relative"
                    >
                        <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for students..."
                            className="pl-10 pr-4 py-2 bg-ttu-sky rounded-full w-64 md:w-80 text-sm focus:outline-none focus:ring-2 focus:ring-ttu-blue/20 transition-all"
                        />
                    </form>
                </div>

                {/* Center/Right: Navigation */}
                <div className="flex items-center gap-1 md:gap-6">
                    <Link to="/" className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${isActive('/') ? 'text-ttu-blue bg-ttu-gold/15' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <Home className={`h-6 w-6 ${isActive('/') ? 'fill-current' : ''}`} />
                        <span className="text-xs font-medium hidden md:block">Home</span>
                    </Link>

                    <Link to="/network" className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${isActive('/network') ? 'text-ttu-blue bg-ttu-gold/15' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <Users className={`h-6 w-6 ${isActive('/network') ? 'fill-current' : ''}`} />
                        <span className="text-xs font-medium hidden md:block">Network</span>
                    </Link>

                    <Link to="/notifications" className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${isActive('/notifications') ? 'text-ttu-blue bg-ttu-gold/15' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <div className="relative">
                            <Bell className={`h-6 w-6 ${isActive('/notifications') ? 'fill-current' : ''}`} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-medium hidden md:block">Notifications</span>
                    </Link>

                    <Link to="/messages" className="relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors text-slate-500 hover:bg-slate-50">
                        <div className="relative">
                            <MessageCircle className="h-6 w-6" />
                            {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">5</span> */}
                        </div>
                        <span className="text-xs font-medium hidden md:block">Messages</span>
                    </Link>

                    {/* Profile Dropdown Trigger */}
                    <div ref={dropdownRef} className="ml-2 pl-2 border-l border-slate-200 flex items-center gap-2 relative">
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center gap-2 hover:bg-slate-50 rounded-lg p-1 transition-colors"
                        >
                            <img
                                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=random`}
                                alt="Profile"
                                className="h-9 w-9 rounded-full object-cover border border-slate-200"
                            />
                            <span className="hidden lg:block text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                                {profile?.full_name?.split(' ')[0] || 'User'}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 z-50">
                                <div className="bg-white rounded-xl shadow-lg border border-slate-100 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <Link
                                        to="/profile"
                                        onClick={handleProfileClick}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                    >
                                        <span className="font-medium">View Profile</span>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
