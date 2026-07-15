import React, { useEffect, useState } from 'react'
import StudentLayout from '../layouts/StudentLayout'
import { courseService } from '../services/courseService'
import { resourceService } from '../services/resourceService'
import { Loader2, BookOpen, FileText, Video, ThumbsUp, Plus, X, ExternalLink } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { formatDistanceToNow } from 'date-fns'

const TYPE_ICON = { notes: FileText, past_question: BookOpen, video: Video }
const TYPE_LABEL = { notes: 'Notes', past_question: 'Past Questions', video: 'Video' }

export default function AcademicResources() {
    const [resources, setResources] = useState([])
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [typeFilter, setTypeFilter] = useState('all')
    const [showForm, setShowForm] = useState(false)
    const [upvoted, setUpvoted] = useState({})

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [res, courseList] = await Promise.all([
                resourceService.getRecommendedResources(),
                courseService.getCourses()
            ])
            setResources(res)
            setCourses(courseList)

            const votes = {}
            await Promise.all(res.map(async r => {
                votes[r.id] = await resourceService.hasUserUpvoted(r.id)
            }))
            setUpvoted(votes)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [])

    const handleUpvote = async (resource) => {
        // Optimistic update
        const wasUpvoted = upvoted[resource.id]
        setUpvoted(prev => ({ ...prev, [resource.id]: !wasUpvoted }))
        setResources(prev => prev.map(r =>
            r.id === resource.id ? { ...r, upvote_count: r.upvote_count + (wasUpvoted ? -1 : 1) } : r
        ))
        try {
            await resourceService.toggleUpvote(resource.id)
        } catch (e) {
            console.error(e)
            fetchAll() // revert by re-fetching on failure
        }
    }

    const filtered = typeFilter === 'all' ? resources : resources.filter(r => r.resource_type === typeFilter)

    return (
        <StudentLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Academic Resources</h1>
                        <p className="text-slate-500 mt-1">Notes, past questions, and videos shared by fellow students — matched to your courses first.</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" /> Upload
                    </Button>
                </div>

                <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit overflow-x-auto">
                    {['all', 'notes', 'past_question', 'video'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${typeFilter === t ? 'bg-ttu-blue text-white' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {t === 'all' ? 'All' : TYPE_LABEL[t]}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-ttu-blue" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-500">
                        No resources yet. Be the first to share something for your course.
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {filtered.map(r => {
                            const Icon = TYPE_ICON[r.resource_type]
                            const link = r.file_url || r.external_link
                            return (
                                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                                <Icon className="h-4 w-4 text-ttu-blue" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-sm">{r.title}</h3>
                                                <p className="text-xs text-slate-500">{r.course?.code || 'Uncategorized'} · {TYPE_LABEL[r.resource_type]}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {r.description && <p className="text-sm text-slate-600">{r.description}</p>}

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <button
                                            onClick={() => handleUpvote(r)}
                                            className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg transition-colors ${upvoted[r.id] ? 'text-ttu-blue bg-blue-50' : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            <ThumbsUp className={`h-4 w-4 ${upvoted[r.id] ? 'fill-current' : ''}`} /> {r.upvote_count}
                                        </button>

                                        {link && (
                                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-ttu-blue flex items-center gap-1 hover:underline">
                                                Open <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        {r.uploader?.full_name} · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {showForm && (
                <UploadForm courses={courses} onClose={() => setShowForm(false)} onCreated={fetchAll} />
            )}
        </StudentLayout>
    )
}

function UploadForm({ courses, onClose, onCreated }) {
    const [courseId, setCourseId] = useState(courses[0]?.id || '')
    const [type, setType] = useState('notes')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [file, setFile] = useState(null)
    const [externalLink, setExternalLink] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!courseId || !title.trim() || (!file && !externalLink.trim())) {
            setError('Course, title, and either a file or a link are required.')
            return
        }
        setLoading(true)
        setError('')
        try {
            await resourceService.uploadResource({
                course_id: courseId,
                resource_type: type,
                title,
                description,
                file,
                external_link: externalLink
            })
            onCreated()
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to upload resource')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Share a Resource</h2>
                    <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <select
                        value={courseId}
                        onChange={e => setCourseId(e.target.value)}
                        className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
                    >
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        {['notes', 'past_question', 'video'].map(t => (
                            <button
                                type="button"
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex-1 py-2 rounded-lg text-xs font-semibold ${type === t ? 'bg-ttu-blue text-white' : 'bg-slate-100 text-slate-600'}`}
                            >
                                {TYPE_LABEL[t]}
                            </button>
                        ))}
                    </div>

                    <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                    <textarea
                        placeholder="Description (optional)"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full min-h-[70px] p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none"
                    />
                    <Input placeholder="Link (e.g. YouTube, Google Drive) — or attach a file below" value={externalLink} onChange={e => setExternalLink(e.target.value)} />
                    <input type="file" onChange={e => setFile(e.target.files[0])} className="text-sm" />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
