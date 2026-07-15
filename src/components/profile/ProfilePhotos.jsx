import React, { useEffect, useState } from 'react'
import { postService } from '../../services/postService'
import { Loader2, Image as ImageIcon } from 'lucide-react'

export default function ProfilePhotos({ userId }) {
    const [photos, setPhotos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPhotos = async () => {
            setLoading(true)
            try {
                // Determine if we should create a specific getPhotos method or reuse getPosts and filter
                // Reusing getPostsByUser and filtering for media_url != null is easiest for now
                const posts = await postService.getPostsByUser(userId)
                const photoPosts = posts.filter(post => post.media_url)
                setPhotos(photoPosts)
            } catch (error) {
                console.error('Error getting photos:', error)
            } finally {
                setLoading(false)
            }
        }
        if (userId) fetchPhotos()
    }, [userId])

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-ttu-blue" />
            </div>
        )
    }

    if (photos.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No photos yet</h3>
                <p className="text-slate-500">Photos you post will appear here.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="font-bold text-slate-900">Photos ({photos.length})</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(post => (
                    <div key={post.id} className="aspect-square rounded-lg overflow-hidden bg-slate-100 group relative cursor-pointer">
                        <img
                            src={post.media_url}
                            alt="Post content"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
