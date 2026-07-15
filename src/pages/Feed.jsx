import React, { useEffect, useState } from 'react'
import StudentLayout from '../layouts/StudentLayout'
import CreatePost from '../components/feed/CreatePost'
import PostCard from '../components/feed/PostCard'
import { postService } from '../services/postService'
import { Loader2 } from 'lucide-react'

export default function Feed() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = async () => {
        try {
            const data = await postService.getFeed()
            // Emergency alerts always float to the top of the feed
            const sorted = [...data].sort((a, b) => (b.is_urgent === true) - (a.is_urgent === true))
            setPosts(sorted)
        } catch (error) {
            console.error('Error fetching feed:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    return (
        <StudentLayout>
            <CreatePost onPostCreated={fetchPosts} />

            {/* Feed Content */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-ttu-blue" />
                    </div>
                ) : posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} onDelete={(postId) => setPosts(prev => prev.filter(p => p.id !== postId))} />
                    ))
                ) : (
                    <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                        <p className="text-slate-500">No posts yet. Be the first to share something!</p>
                    </div>
                )}
            </div>
        </StudentLayout>
    )
}
