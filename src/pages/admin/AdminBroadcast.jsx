import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { postService } from '../../services/postService'
import { Button } from '../../components/ui/Button'
import { Megaphone, Image as ImageIcon, Loader2, Send, AlertTriangle } from 'lucide-react'

export default function AdminBroadcast() {
    const [content, setContent] = useState('')
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [isUrgent, setIsUrgent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim() && !image) return

        setLoading(true)
        setError('')
        setSuccess(false)

        try {
            await postService.createPost({
                content,
                file: image,
                visibility: 'public',
                feeling: isUrgent
                    ? { type: 'emergency', label: 'issued an EMERGENCY ALERT', icon: '🚨' }
                    : { type: 'broadcast', label: 'made an announcement', icon: '📢' },
                is_urgent: isUrgent
            })

            setSuccess(true)
            setContent('')
            setImage(null)
            setImagePreview(null)
            setIsUrgent(false)

            // Reset success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000)

        } catch (err) {
            console.error('Broadcast error:', err)
            setError(err.message || 'Failed to send broadcast')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Megaphone className="h-5 w-5 text-ttu-blue" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Make an Announcement</h2>
                        <p className="text-sm text-slate-500">
                            Broadcast a message to all students. It will appear on their feed immediately.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <textarea
                            placeholder="What's the update, Admin?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full min-h-[150px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ttu-blue focus:border-transparent resize-none text-slate-900 placeholder-slate-400"
                        />
                    </div>

                    {imagePreview && (
                        <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-[300px] object-cover" />
                            <button
                                type="button"
                                onClick={() => {
                                    setImage(null)
                                    setImagePreview(null)
                                }}
                                className="absolute top-2 right-2 bg-slate-900/50 hover:bg-slate-900/70 text-white p-1 rounded-full transition-colors"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isUrgent ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200 hover:border-red-200'}`}>
                        <input
                            type="checkbox"
                            checked={isUrgent}
                            onChange={(e) => setIsUrgent(e.target.checked)}
                            className="h-4 w-4 accent-red-600"
                        />
                        <AlertTriangle className={`h-5 w-5 ${isUrgent ? 'text-red-600' : 'text-slate-400'}`} />
                        <div>
                            <span className={`text-sm font-semibold ${isUrgent ? 'text-red-700' : 'text-slate-700'}`}>
                                Mark as Emergency Alert
                            </span>
                            <p className="text-xs text-slate-500">
                                Pins this to the top of every student's feed with an urgent badge. Use only for genuine emergencies.
                            </p>
                        </div>
                    </label>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
                            <span className="font-bold">✓</span> Announcement sent successfully!
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-ttu-blue transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
                            <ImageIcon className="h-5 w-5" />
                            <span className="text-sm font-medium">Add Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>

                        <Button
                            type="submit"
                            disabled={loading || (!content.trim() && !image)}
                            className="bg-ttu-blue hover:bg-blue-800 text-white min-w-[120px]"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            Broadcast
                        </Button>
                    </div>
                </form>
            </div>

            {/* Preview/Tips Section could go here */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Pro Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Announcements are public and visible to everyone.</li>
                    <li>They bypass the moderation queue.</li>
                    <li>Use images to increase engagement.</li>
                </ul>
            </div>
        </div>
    )
}
