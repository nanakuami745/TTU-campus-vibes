import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { Check, X, Loader2, PlayCircle, Image, Globe, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function AdminModeration() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const data = await adminService.getPendingPosts()
            setPosts(data)
        } catch (error) {
            console.error('Error fetching pending posts:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const [processingId, setProcessingId] = useState(null)

    const handleApprove = async (postId) => {
        setProcessingId(postId)
        try {
            await adminService.approvePost(postId)
            setPosts(prev => prev.filter(p => p.id !== postId))
        } catch (error) {
            console.error('Error approving post:', error)
            alert('Failed to approve post')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (postId) => {
        if (!confirm('Are you sure you want to reject this post?')) return

        setProcessingId(postId)
        try {
            await adminService.rejectPost(postId)
            setPosts(prev => prev.filter(p => p.id !== postId))
        } catch (error) {
            console.error('Error rejecting post:', error)
            alert('Failed to reject post')
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-ttu-blue" />
            </div>
        )
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Content Moderation</h1>
                <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-orange-100">
                    <AlertCircle className="h-4 w-4" />
                    {posts.length} Pending Review
                </div>
            </div>

            {posts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">All Caught Up!</h3>
                    <p className="text-slate-500">There are no pending posts to review at this time.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${post.author?.full_name}&background=random`}
                                        alt={post.author?.full_name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{post.author?.full_name}</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                            <span>•</span>
                                            <Globe className="h-3 w-3" />
                                            Public Post
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReject(post.id)}
                                        disabled={!!processingId}
                                        className="px-4 py-2 bg-white border border-slate-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {processingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(post.id)}
                                        disabled={!!processingId}
                                        className="px-4 py-2 bg-ttu-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {processingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        Approve
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <p className="text-slate-800 whitespace-pre-wrap mb-4 font-medium text-lg leading-relaxed">
                                    {post.content}
                                </p>

                                {post.feeling && (
                                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm">
                                        <span>is feeling {post.feeling.emoji} {post.feeling.label}</span>
                                    </div>
                                )}

                                {post.media_url && (
                                    <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-w-2xl">
                                        <img src={post.media_url} alt="Post content" className="w-full h-auto max-h-[400px] object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
