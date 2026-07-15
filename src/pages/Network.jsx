import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import { Users, Search, UserPlus, UserCheck, Clock, X, Check } from 'lucide-react'
import { friendService } from '../services/friendService'
import { useAuth } from '../context/AuthContext'

export default function Network() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
    const [searchResults, setSearchResults] = useState([])
    const [pendingRequests, setPendingRequests] = useState([])
    const [friends, setFriends] = useState([])
    const [suggestedFriends, setSuggestedFriends] = useState([])
    const [loading, setLoading] = useState(false)

    // Initial Load
    useEffect(() => {
        loadNetworkData()
    }, [])

    // If the person searched from the navbar, run that search here too
    useEffect(() => {
        const q = searchParams.get('q')
        if (q && q.trim()) {
            runSearch(q)
        }
    }, [searchParams])

    const loadNetworkData = async () => {
        try {
            const requests = await friendService.getPendingRequests()
            setPendingRequests(requests)

            const myFriends = await friendService.getFriends()
            setFriends(myFriends)

            const suggestions = await friendService.getSuggestedFriends()
            setSuggestedFriends(suggestions)
        } catch (error) {
            console.error('Error loading network:', error)
        }
    }

    const runSearch = async (query) => {
        if (!query.trim()) return

        setLoading(true)
        try {
            const results = await friendService.searchUsers(query)
            // Enhance results with friendship status
            const resultsWithStatus = await Promise.all(results.map(async (profile) => {
                const status = await friendService.getFriendshipStatus(profile.id)
                return { ...profile, friendshipStatus: status }
            }))
            setSearchResults(resultsWithStatus)
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Actions
    const sendRequest = async (targetId) => {
        try {
            await friendService.sendRequest(targetId)
            // Update local state to show 'sent'
            setSearchResults(prev => prev.map(p => p.id === targetId ? { ...p, friendshipStatus: 'sent' } : p))
            setSuggestedFriends(prev => prev.filter(p => p.id !== targetId))
        } catch (error) {
            console.error('Error sending request:', error)
        }
    }

    const acceptRequest = async (friendshipId) => {
        try {
            await friendService.respondToRequest(friendshipId, 'accepted')
            loadNetworkData() // Reload to move from pending to friends
        } catch (error) {
            console.error('Error accepting:', error)
        }
    }

    const rejectRequest = async (friendshipId) => {
        try {
            await friendService.respondToRequest(friendshipId, 'rejected')
            loadNetworkData()
        } catch (error) {
            console.error('Error rejecting:', error)
        }
    }

    return (
        <StudentLayout>
            <div className="space-y-6">

                {/* Search Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">My Network</h1>
                    <p className="text-slate-500 mb-6">Connect with fellow students.</p>

                    <form onSubmit={(e) => { e.preventDefault(); runSearch(searchQuery) }} className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name (e.g., Kwame)..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-ttu-blue/20 transition-all font-medium"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-ttu-blue text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors">
                            Search
                        </button>
                    </form>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Search Results</h3>
                            {searchResults.map(person => (
                                <div key={person.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                                    <Link to={`/profile/${person.id}`} className="flex items-center gap-3">
                                        <img
                                            src={person.avatar_url || `https://ui-avatars.com/api/?name=${person.full_name}&background=random`}
                                            alt={person.full_name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-bold text-slate-900">{person.full_name}</h4>
                                            <p className="text-xs text-slate-500">{person.department || 'Student'}</p>
                                        </div>
                                    </Link>

                                    {person.friendshipStatus === 'none' && (
                                        <button onClick={() => sendRequest(person.id)} className="flex items-center gap-1 text-ttu-blue bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100">
                                            <UserPlus className="h-4 w-4" /> Connect
                                        </button>
                                    )}
                                    {person.friendshipStatus === 'sent' && (
                                        <button disabled className="flex items-center gap-1 text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium cursor-not-allowed">
                                            <Clock className="h-4 w-4" /> Sent
                                        </button>
                                    )}
                                    {person.friendshipStatus === 'friends' && (
                                        <button disabled className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium cursor-not-allowed">
                                            <UserCheck className="h-4 w-4" /> Friends
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* People You May Know */}
                {suggestedFriends.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-1">People You May Know</h3>
                        <p className="text-xs text-slate-500 mb-4">From your department</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {suggestedFriends.map(person => (
                                <div key={person.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                                    <Link to={`/profile/${person.id}`} className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={person.avatar_url || `https://ui-avatars.com/api/?name=${person.full_name}&background=random`}
                                            alt={person.full_name}
                                            className="h-10 w-10 rounded-full object-cover shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-900 text-sm truncate">{person.full_name}</h4>
                                            <p className="text-xs text-slate-500 truncate">{person.department}</p>
                                        </div>
                                    </Link>
                                    <button onClick={() => sendRequest(person.id)} className="text-ttu-blue bg-blue-50 p-2 rounded-lg hover:bg-blue-100 shrink-0">
                                        <UserPlus className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            Pending Requests
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                                    <Link to={`/profile/${req.requester?.id}`} className="flex items-center gap-3">
                                        <img
                                            src={req.requester?.avatar_url || `https://ui-avatars.com/api/?name=${req.requester?.full_name}&background=random`}
                                            alt={req.requester?.full_name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{req.requester?.full_name}</h4>
                                            <p className="text-xs text-slate-500">wants to connect</p>
                                        </div>
                                    </Link>
                                    <div className="flex gap-2">
                                        <button onClick={() => acceptRequest(req.id)} className="p-2 bg-ttu-blue text-white rounded-lg hover:bg-blue-900">
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => rejectRequest(req.id)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* My Friends List */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4">My Friends ({friends.length})</h3>

                    {friends.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {friends.map(friend => (
                                <div key={friend.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                                    <Link to={`/profile/${friend.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                        <img
                                            src={friend.avatar_url || `https://ui-avatars.com/api/?name=${friend.full_name}&background=random`}
                                            alt={friend.full_name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-900 text-sm truncate">{friend.full_name}</h4>
                                            <p className="text-xs text-slate-500">Student</p>
                                        </div>
                                    </Link>
                                    <button onClick={() => navigate(`/messages?userId=${friend.id}`)} className="ml-auto text-xs text-ttu-blue font-semibold hover:underline shrink-0">Message</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="inline-flex h-12 w-12 bg-slate-100 rounded-full items-center justify-center text-slate-400 mb-3">
                                <Users className="h-6 w-6" />
                            </div>
                            <p className="text-slate-500 text-sm">You haven't added any friends yet.</p>
                        </div>
                    )}
                </div>

            </div>
        </StudentLayout>
    )
}
