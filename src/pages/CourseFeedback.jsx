import React, { useEffect, useState } from 'react'
import StudentLayout from '../layouts/StudentLayout'
import { courseService } from '../services/courseService'
import { feedbackService } from '../services/feedbackService'
import { Loader2, Star, MessageSquareText, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { formatDistanceToNow } from 'date-fns'

export default function CourseFeedback() {
    const [courses, setCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [feedback, setFeedback] = useState([])
    const [aggregate, setAggregate] = useState({ average: null, count: 0 })
    const [loadingCourses, setLoadingCourses] = useState(true)
    const [loadingFeedback, setLoadingFeedback] = useState(false)

    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const fetch = async () => {
            setLoadingCourses(true)
            try {
                const data = await courseService.getRecommendedCourses()
                setCourses(data)
                if (data.length) setSelectedCourse(data[0])
            } catch (e) {
                console.error(e)
            } finally {
                setLoadingCourses(false)
            }
        }
        fetch()
    }, [])

    useEffect(() => {
        if (!selectedCourse) return
        const fetch = async () => {
            setLoadingFeedback(true)
            try {
                const [list, agg] = await Promise.all([
                    feedbackService.getFeedbackForCourse(selectedCourse.id),
                    feedbackService.getAggregateForCourse(selectedCourse.id)
                ])
                setFeedback(list)
                setAggregate(agg)
            } catch (e) {
                console.error(e)
            } finally {
                setLoadingFeedback(false)
            }
        }
        fetch()
        setSubmitted(false)
        setRating(0)
        setComment('')
    }, [selectedCourse])

    const handleSubmit = async () => {
        if (!rating) return
        setSubmitting(true)
        try {
            await feedbackService.submitFeedback({ course_id: selectedCourse.id, rating, comment })
            const [list, agg] = await Promise.all([
                feedbackService.getFeedbackForCourse(selectedCourse.id),
                feedbackService.getAggregateForCourse(selectedCourse.id)
            ])
            setFeedback(list)
            setAggregate(agg)
            setSubmitted(true)
            setRating(0)
            setComment('')
        } catch (e) {
            console.error(e)
            alert('Failed to submit feedback')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <StudentLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Course Feedback</h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        100% anonymous — no submission is ever linked to your account.
                    </p>
                </div>

                {loadingCourses ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-ttu-blue" /></div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-500">
                        No courses available yet. Ask an admin to add some.
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Course list */}
                        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-2 max-h-[500px] overflow-y-auto">
                            {courses.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedCourse(c)}
                                    className={`w-full text-left px-4 py-3 rounded-xl mb-1 transition-colors ${selectedCourse?.id === c.id ? 'bg-blue-50 text-ttu-blue' : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                >
                                    <p className="font-semibold text-sm">{c.code}</p>
                                    <p className="text-xs text-slate-500 truncate">{c.name}</p>
                                </button>
                            ))}
                        </div>

                        {/* Detail + form */}
                        <div className="md:col-span-2 space-y-4">
                            {selectedCourse && (
                                <>
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                        <h2 className="font-bold text-lg text-slate-900">{selectedCourse.code} — {selectedCourse.name}</h2>
                                        {selectedCourse.lecturer_name && (
                                            <p className="text-sm text-slate-500">Lecturer: {selectedCourse.lecturer_name}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <Star key={i} className={`h-5 w-5 ${aggregate.average && i <= Math.round(aggregate.average) ? 'fill-ttu-gold text-ttu-gold' : 'text-slate-200'}`} />
                                                ))}
                                            </div>
                                            <span className="text-sm text-slate-600">
                                                {aggregate.average ? `${aggregate.average} / 5` : 'No ratings yet'} ({aggregate.count} responses)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Submission form */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                                        <h3 className="font-semibold text-slate-900">Leave anonymous feedback</h3>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <button key={i} onClick={() => setRating(i)}>
                                                    <Star className={`h-7 w-7 transition-colors ${i <= rating ? 'fill-ttu-gold text-ttu-gold' : 'text-slate-200'}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            placeholder="What went well? What could improve? (optional)"
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            className="w-full min-h-[80px] p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none"
                                        />
                                        {submitted && <p className="text-sm text-green-600">Thanks — your anonymous feedback was submitted.</p>}
                                        <Button onClick={handleSubmit} disabled={!rating || submitting} className="w-full">
                                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Anonymously'}
                                        </Button>
                                    </div>

                                    {/* Existing feedback */}
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                            <MessageSquareText className="h-4 w-4" /> Recent feedback
                                        </h3>
                                        {loadingFeedback ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-ttu-blue" />
                                        ) : feedback.filter(f => f.comment).length === 0 ? (
                                            <p className="text-sm text-slate-500">No written comments yet.</p>
                                        ) : (
                                            feedback.filter(f => f.comment).map(f => (
                                                <div key={f.id} className="bg-white rounded-xl border border-slate-100 p-3">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <Star key={i} className={`h-3.5 w-3.5 ${i <= f.rating ? 'fill-ttu-gold text-ttu-gold' : 'text-slate-200'}`} />
                                                        ))}
                                                        <span className="text-xs text-slate-400 ml-2">
                                                            {formatDistanceToNow(new Date(f.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700">{f.comment}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    )
}
