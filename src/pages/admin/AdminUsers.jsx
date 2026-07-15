import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { Search, MoreVertical, Ban, CheckCircle, Loader2 } from 'lucide-react'

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const data = await adminService.getUsers(searchTerm)
            setUsers(data)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const debounce = setTimeout(fetchUsers, 500)
        return () => clearTimeout(debounce)
    }, [searchTerm])

    const handleToggleStatus = async (user) => {
        const action = user.is_active ? 'deactivate' : 'reactivate'
        if (!confirm(`Are you sure you want to ${action} ${user.full_name}?`)) return

        try {
            const updatedUser = await adminService.updateUserStatus(user.id, !user.is_active)
            setUsers(users.map(u => u.id === user.id ? updatedUser : u))
        } catch (error) {
            console.error('Error updating user:', error)
            alert('Failed to update user status')
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ttu-blue w-full md:w-80"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Student</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Department</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Loading students...
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        No students found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random`}
                                                    alt={user.full_name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 text-sm">{user.full_name}</h4>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {user.department || 'N/A'}
                                            {user.level && <span className="text-slate-400 ml-1">• L{user.level}</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                    Deactivated
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${user.is_active
                                                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                        }`}
                                                >
                                                    {user.is_active ? (
                                                        <>
                                                            <Ban className="h-3 w-3" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-3 w-3" />
                                                            Reactivate
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
