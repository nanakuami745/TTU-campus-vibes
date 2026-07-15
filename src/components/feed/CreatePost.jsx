import React, { useState, useRef } from 'react'
import { Video, Image, Smile, Loader2, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'
import { postService } from '../../services/postService'

export default function CreatePost({ onPostCreated, courseGroupId = null }) {
    const { profile } = useAuth()
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [visibility, setVisibility] = useState('public')
    const [isFeelingModalOpen, setIsFeelingModalOpen] = useState(false)
    const [feeling, setFeeling] = useState(null)
    const fileInputRef = useRef(null)

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            const isVideo = file.type.startsWith('video/')
            const maxSize = isVideo ? 25 * 1024 * 1024 : 5 * 1024 * 1024
            if (file.size > maxSize) {
                alert(`File size too large (max ${isVideo ? '25MB for video' : '5MB for images'})`)
                return
            }
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleRemoveFile = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async () => {
        if (!content.trim() && !selectedFile) return

        setIsLoading(true)
        try {
            await postService.createPost({
                content,
                file: selectedFile,
                visibility,
                feeling,
                course_group_id: courseGroupId
            })
            setContent('')
            setFeeling(null)
            handleRemoveFile()
            if (onPostCreated) onPostCreated()
        } catch (error) {
            console.error('Error creating post:', error)
            alert('Failed to post. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-slate-100">
                <div className="flex gap-3 mb-4">
                    <img
                        src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=random`}
                        alt="User"
                        className="h-10 w-10 rounded-full object-cover border border-slate-100"
                    />
                    <div className="flex-1 bg-slate-50 rounded-2xl p-2 md:p-3 hover:bg-slate-100 transition-colors cursor-text">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={`What's on your mind, ${profile?.full_name?.split(' ')[0] || 'Student'}?`}
                            className="bg-transparent border-none focus:ring-0 w-full text-sm text-slate-700 placeholder:text-slate-500 resize-none outline-none min-h-[40px]"
                            rows={content.length > 50 ? 3 : 1}
                        />
                        {feeling && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 bg-yellow-50 p-2 rounded-lg inline-flex">
                                <span>is feeling {feeling.emoji} <strong>{feeling.label}</strong></span>
                                <button onClick={() => setFeeling(null)} className="ml-1 hover:text-red-500"><X className="h-3 w-3" /></button>
                            </div>
                        )}
                    </div>
                </div>

                {/* File Preview */}
                {previewUrl && (
                    <div className="relative mb-4 rounded-xl overflow-hidden border border-slate-200">
                        {selectedFile?.type?.startsWith('video/') ? (
                            <video src={previewUrl} controls className="w-full max-h-64" />
                        ) : (
                            <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-cover" />
                        )}
                        <button
                            onClick={handleRemoveFile}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div className="flex gap-2 sm:gap-4">
                        {/* Photo/Video */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            <Image className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium text-slate-600 hidden sm:block">Photo/Video</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,video/*"
                        />

                        {/* Feeling/Activity */}
                        <button
                            onClick={() => setIsFeelingModalOpen(true)}
                            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <Smile className="h-5 w-5 text-yellow-500" />
                            <span className="text-sm font-medium text-slate-600 hidden sm:block">Feeling</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {!courseGroupId && (
                            <select
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value)}
                                className="bg-slate-50 border-none text-sm text-slate-600 font-medium rounded-lg focus:ring-0 cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                <option value="public">Public</option>
                                <option value="friends">Friends</option>
                            </select>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={(!content && !selectedFile) || isLoading}
                            className="px-6 rounded-full bg-ttu-blue hover:bg-blue-900 h-9 text-sm w-24 flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Feeling Modal */}
            {
                isFeelingModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-4 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                                <h3 className="font-bold text-slate-800">How are you feeling?</h3>
                                <button onClick={() => setIsFeelingModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { emoji: '😀', label: 'Happy' },
                                    { emoji: '🤩', label: 'Excited' },
                                    { emoji: '😎', label: 'Cool' },
                                    { emoji: '🤪', label: 'Silly' },
                                    { emoji: '😢', label: 'Sad' },
                                    { emoji: '😡', label: 'Angry' },
                                    { emoji: '😴', label: 'Tired' },
                                    { emoji: '😷', label: 'Sick' },
                                    { emoji: '📚', label: 'Studious' },
                                    { emoji: '🥳', label: 'Celebrating' },
                                ].map((f) => (
                                    <button
                                        key={f.label}
                                        onClick={() => {
                                            setFeeling(f)
                                            setIsFeelingModalOpen(false)
                                        }}
                                        className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                                    >
                                        <span className="text-2xl">{f.emoji}</span>
                                        <span className="font-medium text-slate-700">{f.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}
