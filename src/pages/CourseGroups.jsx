import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import { courseGroupService } from '../services/courseGroupService'
import { Loader2, Users2, Pin, ChevronRight, Plus, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function CourseGroups() {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [creatableCourses, setCreatableCourses] = useState([])
    const [showForm, setShowForm] = useState(false)

    const fetchGroups = async () => {
        setLoading(true)
        try {
            const data = await courseGroupService.getRecommendedGroups()
            setGroups(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGroups()
        courseGroupService.getMyCreatableCourses().then(setCreatableCourses).catch(console.error)
    }, [])

    return (
        <StudentLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Course Groups</h1>
                        <p className="text-slate-500 mt-1">Discussion spaces for specific courses — join the ones relevant to you.</p>
                    </div>
                    {creatableCourses.length > 0 && (
                        <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0">
                            <Plus className="h-4 w-4" /> New Group
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-ttu-blue" /></div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-500">
                        <Users2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        No course groups yet. {creatableCourses.length > 0 ? 'Start one!' : 'Ask your class rep to create one.'}
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {groups.map(g => (
                            <Link
                                key={g.id}
                                to={`/course-groups/${g.id}`}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between gap-3 hover:border-ttu-gold/40 transition-colors"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-9 w-9 rounded-xl bg-ttu-sky flex items-center justify-center shrink-0">
                                            <Users2 className="h-4 w-4 text-ttu-blue" />
                                        </div>
                                        <h3 className="font-bold text-slate-900">{g.name}</h3>
                                    </div>
                                    <p className="text-xs text-slate-500">{g.course?.code} — {g.course?.name}</p>
                                    <p className="text-xs text-slate-400 mt-1">{g.members?.[0]?.count || 0} members</p>
                                    {g.pinned_announcement && (
                                        <p className="text-xs text-amber-700 bg-ttu-gold/10 rounded-lg px-2 py-1 mt-2 flex items-start gap-1">
                                            <Pin className="h-3 w-3 mt-0.5 shrink-0" /> {g.pinned_announcement}
                                        </p>
                                    )}
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-300 shrink-0" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {showForm && (
                <NewGroupForm
                    courses={creatableCourses}
                    onClose={() => setShowForm(false)}
                    onCreated={fetchGroups}
                />
            )}
        </StudentLayout>
    )
}

function NewGroupForm({ courses, onClose, onCreated }) {
    const [courseId, setCourseId] = useState(courses[0]?.id || '')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!courseId || !name.trim()) {
            setError('Course and group name are required.')
            return
        }
        setLoading(true)
        setError('')
        try {
            await courseGroupService.createGroup({ course_id: courseId, name, description })
            onCreated()
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to create group')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">New Course Group</h2>
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
                    <Input placeholder="Group name (e.g. CS 301 Study Group)" value={name} onChange={e => setName(e.target.value)} />
                    <textarea
                        placeholder="Description (optional)"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full min-h-[70px] p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none"
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Group'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
