import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal, ThumbsUp, MessageCircle, Share2, Globe, Users, Send, X, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { postService } from '../../services/postService'
import { useAuth } from '../../context/AuthContext'

export default function PostCard({ post, onDelete }) {
    if (!post) return null

    const { user, profile } = useAuth()
    const { author, content, media_url, media_type, created_at, visibility, id, feeling, status, is_urgent } = post

    // Local State for interactions
    const [liked, setLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [showMenu, setShowMenu] = useState(false)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const canDelete = user?.id === author?.id || profile?.role === 'admin'

    const handleDelete = async () => {
        if (!confirm('Delete this post? This cannot be undone.')) return
        setDeleting(true)
        try {
            await postService.deletePost(id)
            if (onDelete) onDelete(id)
        } catch (e) {
            alert('Failed to delete post')
        } finally {
            setDeleting(false)
            setShowMenu(false)
        }
    }

    const [comments, setComments] = useState([])
    const [commentCount, setCommentCount] = useState(0)
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [loadingComments, setLoadingComments] = useState(false)

    // Initialize stats safely
    useEffect(() => {
        const initialLikes = Array.isArray(post.likes) && post.likes[0] ? post.likes[0].count : 0
        const initialComments = Array.isArray(post.comments) && post.comments[0] ? post.comments[0].count : 0
        setLikeCount(initialLikes)
        setCommentCount(initialComments)

        // Check if current user liked
        checkIfLiked()
    }, [post])

    const checkIfLiked = async () => {
        try {
            const hasLiked = await postService.hasUserLiked(id)
            setLiked(hasLiked)
        } catch (e) {
            console.error('Error checking like status', e)
        }
    }

    // Handle Like
    const handleLike = async () => {
        // Optimistic UI update
        const previousLiked = liked
        const previousCount = likeCount

        setLiked(!liked)
        setLikeCount(liked ? likeCount - 1 : likeCount + 1)

        try {
            await postService.toggleLike(id)
        } catch (error) {
            // Revert on error
            setLiked(previousLiked)
            setLikeCount(previousCount)
            console.error('Error toggling like:', error)
        }
    }

    // Handle Comments View
    const toggleComments = async () => {
        if (!showComments) {
            setLoadingComments(true)
            try {
                const data = await postService.getComments(id)
                setComments(data)
            } catch (error) {
                console.error('Error fetching comments:', error)
            } finally {
                setLoadingComments(false)
            }
        }
        setShowComments(!showComments)
    }

    // Handle Add Comment
    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return

        try {
            const comment = await postService.addComment(id, newComment)
            setComments([...comments, comment])
            setCommentCount(commentCount + 1)
            setNewComment('')
        } catch (error) {
            console.error('Error adding comment:', error)
        }
    }

    // Handle Share (Mock)
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
    }

    // Date formatting
    let timeParam = ''
    try {
        timeParam = created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true }) : ''
    } catch (e) {
        timeParam = 'Just now'
    }

    return (
        <div className={`bg-white rounded-3xl shadow-sm p-4 mb-4 border ${is_urgent ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-100'}`}>
            {is_urgent && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-xl mb-3">
                    🚨 Emergency Alert
                </div>
            )}
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex gap-3">
                    <Link to={`/profile/${author?.id}`}>
                        <img
                            src={author?.avatar_url || `https://ui-avatars.com/api/?name=${author?.full_name || 'User'}&background=random`}
                            alt={author?.full_name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-ttu-gold"
                        />
                    </Link>
                    <div>
                        <Link to={`/profile/${author?.id}`}>
                            <h4 className="font-display font-bold text-slate-900 text-sm leading-tight hover:underline">
                                {author?.full_name || 'Unknown User'}
                                {feeling && (
                                    <span className="font-sans font-normal text-slate-500 ml-1">
                                        is feeling {feeling.emoji} {feeling.label}
                                    </span>
                                )}
                            </h4>
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {author?.role || 'Student'}
                            {status === 'pending' && (
                                <span className="ml-2 bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-yellow-200">
                                    Pending Approval
                                </span>
                            )}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <span>{timeParam}</span>
                            <span>•</span>
                            {visibility === 'public' ? <Globe className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <button onClick={() => setShowMenu(prev => !prev)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-full">
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-8 bg-white border border-slate-100 rounded-xl shadow-xl z-20 min-w-[140px] py-1">
                                {canDelete ? (
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" /> {deleting ? 'Deleting...' : 'Delete Post'}
                                    </button>
                                ) : (
                                    <p className="px-3 py-2 text-sm text-slate-400">No actions available</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="mb-4">
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>

            {/* Media */}
            {media_url && (
                <div className="mb-4 rounded-xl overflow-hidden border border-slate-100">
                    {media_type === 'video' ? (
                        <video src={media_url} controls className="w-full h-auto max-h-[500px]" />
                    ) : (
                        <button onClick={() => setLightboxOpen(true)} className="block w-full cursor-zoom-in">
                            <img src={media_url} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" />
                        </button>
                    )}
                </div>
            )}

            {lightboxOpen && media_type !== 'video' && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X className="h-8 w-8" />
                    </button>
                    <img src={media_url} alt="Post content" className="max-w-full max-h-full object-contain rounded-lg" onClick={e => e.stopPropagation()} />
                </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-1">
                    <div className="h-5 w-5 bg-ttu-blue rounded-full flex items-center justify-center">
                        <ThumbsUp className="h-3 w-3 text-white fill-current" />
                    </div>
                    <span>{likeCount}</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={toggleComments} className="hover:underline">{commentCount} comments</button>
                    <button onClick={handleShare} className="hover:underline">Share</button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-colors font-medium text-sm ${liked ? 'text-ttu-blue bg-ttu-gold/15' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <ThumbsUp className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                    <span>Like</span>
                </button>
                <button
                    onClick={toggleComments}
                    className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-full transition-colors text-slate-500 font-medium text-sm"
                >
                    <MessageCircle className="h-5 w-5" />
                    <span>Comment</span>
                </button>
                <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-full transition-colors text-slate-500 font-medium text-sm"
                >
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    {/* Comment List */}
                    {comments.length > 0 && (
                        <div className="space-y-4 mb-4 pl-2 lg:pl-4">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex gap-3">
                                    <img
                                        src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${comment.author?.full_name}&background=random`}
                                        alt={comment.author?.full_name}
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="bg-slate-100 rounded-2xl px-4 py-2 inline-block">
                                            <h5 className="font-bold text-xs text-slate-900">{comment.author?.full_name}</h5>
                                            <p className="text-sm text-slate-800">{comment.content}</p>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-slate-500 font-medium">
                                            <button className="hover:underline">Like</button>
                                            <button className="hover:underline">Reply</button>
                                            <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {loadingComments && comments.length === 0 && (
                        <div className="text-center py-4 text-slate-500 text-sm">Loading comments...</div>
                    )}

                    {/* Comment Input */}
                    <form onSubmit={handleAddComment} className="flex gap-3 items-start">
                        <img
                            src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=Me&background=random`}
                            alt="Me"
                            className="h-8 w-8 rounded-full object-cover border border-slate-100 mt-1"
                        />
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full bg-slate-100 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ttu-blue/20"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-ttu-blue disabled:opacity-50 hover:bg-blue-50 p-1 rounded-full transition-colors"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
