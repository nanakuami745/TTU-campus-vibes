import React, { useEffect, useState } from 'react'
import { courseService } from '../../services/courseService'
import { feedbackService } from '../../services/feedbackService'
import { Loader2, Star, Trash2, ShieldAlert } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function AdminFeedbackModeration() {
    const [courses, setCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [feedback, setFeedback] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            const data = await courseService.getCourses()
            setCourses(data)
            if (data.length) setSelectedCourse(data[0])
        }
        fetch()
    }, [])

    useEffect(() => {
        if (!selectedCourse) return
        const fetch = async () => {
            setLoading(true)
            try {
                const data = await feedbackService.getFeedbackForCourse(selectedCourse.id)
                setFeedback(data)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [selectedCourse])

    const handleDelete = async (id) => {
        if (!confirm('Remove this feedback entry? This cannot be undone.')) return
        try {
            await feedbackService.deleteFeedback(id)
            setFeedback(prev => prev.filter(f => f.id !== id))
        } catch (e) {
            alert('Failed to delete entry')
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Course Feedback Moderation</h1>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    Entries have no student identity attached — you can remove abusive content, but not trace its author.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 p-2 max-h-[500px] overflow-y-auto">
                    {courses.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCourse(c)}
                            className={`w-full text-left px-4 py-3 rounded-lg mb-1 ${selectedCourse?.id === c.id ? 'bg-blue-50 text-ttu-blue' : 'hover:bg-slate-50'}`}
                        >
                            <p className="font-semibold text-sm">{c.code}</p>
                            <p className="text-xs text-slate-500 truncate">{c.name}</p>
                        </button>
                    ))}
                </div>

                <div className="md:col-span-2 space-y-2">
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-ttu-blue" />
                    ) : feedback.length === 0 ? (
                        <p className="text-sm text-slate-500">No feedback submitted for this course yet.</p>
                    ) : (
                        feedback.map(f => (
                            <div key={f.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className={`h-4 w-4 ${i <= f.rating ? 'fill-ttu-gold text-ttu-gold' : 'text-slate-200'}`} />
                                        ))}
                                        <span className="text-xs text-slate-400 ml-2">
                                            {formatDistanceToNow(new Date(f.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    {f.comment && <p className="text-sm text-slate-700">{f.comment}</p>}
                                </div>
                                <button onClick={() => handleDelete(f.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 shrink-0">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
