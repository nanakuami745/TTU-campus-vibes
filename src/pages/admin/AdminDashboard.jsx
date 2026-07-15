import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { Users, FileText, AlertCircle, TrendingUp, Loader2 } from 'lucide-react'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalPosts: 0,
        pendingPosts: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getStats()
                setStats(data)
            } catch (error) {
                console.error('Failed to load stats:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-ttu-blue" />
            </div>
        )
    }

    const statCards = [
        {
            label: 'Total Students',
            value: stats.totalStudents,
            icon: Users,
            color: 'bg-blue-500',
            trend: '+12% this month'
        },
        {
            label: 'Total Posts',
            value: stats.totalPosts,
            icon: FileText,
            color: 'bg-emerald-500',
            trend: '+5% this week'
        },
        {
            label: 'Pending Reviews',
            value: stats.pendingPosts,
            icon: AlertCircle,
            color: 'bg-amber-500',
            trend: 'Requires attention'
        }
    ]

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg text-white shadow-lg shadow-blue-500/20`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-600 font-medium">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions or Recent Activity could go here */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Welcome to the Admin Panel</h2>
                <p className="text-slate-600">
                    Use the sidebar navigation to moderate posts (`Moderation`) or manage student accounts (`User Management`).
                </p>
            </div>
        </div>
    )
}
