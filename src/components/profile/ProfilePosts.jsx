import React, { useEffect, useState } from 'react'
import PostCard from '../feed/PostCard'
import { postService } from '../../services/postService'
import { Loader2 } from 'lucide-react'

export default function ProfilePosts({ userId }) {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true)
            try {
                const data = await postService.getPostsByUser(userId)
                setPosts(data)
            } catch (error) {
                console.error('Error fetching user posts:', error)
            } finally {
                setLoading(false)
            }
        }

        if (userId) {
            fetchPosts()
        }
    }, [userId])

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-ttu-blue" />
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
                <p className="text-slate-500">No posts yet.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {posts.map(post => (
                <PostCard key={post.id} post={post} onDelete={(postId) => setPosts(prev => prev.filter(p => p.id !== postId))} />
            ))}
        </div>
    )
}
