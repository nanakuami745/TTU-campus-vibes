import React, { useEffect, useState } from 'react'
import { classRepService } from '../../services/classRepService'
import { courseService } from '../../services/courseService'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { UserCog, Loader2, Trash2, Plus, X } from 'lucide-react'

export default function AdminClassReps() {
    const [reps, setReps] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    const fetchReps = async () => {
        setLoading(true)
        try {
            const data = await classRepService.getAllReps()
            setReps(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchReps() }, [])

    const handleRemove = async (id) => {
        if (!confirm('Remove this class rep assignment?')) return
        try {
            await classRepService.removeRep(id)
            setReps(prev => prev.filter(r => r.id !== id))
        } catch (e) {
            alert('Failed to remove assignment')
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Class Reps</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Assign students permission to run attendance sessions — scoped to one specific course at a time.
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Assign Rep
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Student</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Course</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={3} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin text-ttu-blue mx-auto" /></td></tr>
                            ) : reps.length === 0 ? (
                                <tr><td colSpan={3} className="text-center py-10 text-slate-500">
                                    <UserCog className="h-6 w-6 mx-auto mb-2 text-slate-300" /> No class reps assigned yet.
                                </td></tr>
                            ) : reps.map(rep => (
                                <tr key={rep.id}>
                                    <td className="px-6 py-4 font-medium text-slate-900">{rep.user?.full_name}</td>
                                    <td className="px-6 py-4 text-slate-600">{rep.course?.code} — {rep.course?.name}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleRemove(rep.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <AssignRepForm onClose={() => setShowForm(false)} onCreated={fetchReps} />
            )}
        </div>
    )
}

function AssignRepForm({ onClose, onCreated }) {
    const [search, setSearch] = useState('')
    const [students, setStudents] = useState([])
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [courses, setCourses] = useState([])
    const [courseId, setCourseId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        courseService.getCourses().then(data => {
            setCourses(data)
            if (data.length) setCourseId(data[0].id)
        })
    }, [])

    useEffect(() => {
        if (search.trim().length < 2) { setStudents([]); return }
        const timeout = setTimeout(async () => {
            try {
                const data = await classRepService.searchStudents(search)
                setStudents(data)
            } catch (e) { console.error(e) }
        }, 300)
        return () => clearTimeout(timeout)
    }, [search])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedStudent || !courseId) {
            setError('Select a student and a course.')
            return
        }
        setLoading(true)
        setError('')
        try {
            await classRepService.assignRep({ user_id: selectedStudent.id, course_id: courseId })
            onCreated()
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to assign rep')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Assign Class Rep</h2>
                    <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-xs text-slate-500">Search student by name or email</label>
                        <Input placeholder="Start typing..." value={selectedStudent ? selectedStudent.full_name : search} onChange={e => { setSearch(e.target.value); setSelectedStudent(null) }} />
                        {students.length > 0 && !selectedStudent && (
                            <div className="border border-slate-200 rounded-lg mt-1 max-h-40 overflow-y-auto">
                                {students.map(s => (
                                    <button
                                        type="button"
                                        key={s.id}
                                        onClick={() => { setSelectedStudent(s); setStudents([]) }}
                                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                                    >
                                        <p className="font-medium text-slate-800">{s.full_name}</p>
                                        <p className="text-xs text-slate-500">{s.email}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-xs text-slate-500">Course</label>
                        <select
                            value={courseId}
                            onChange={e => setCourseId(e.target.value)}
                            className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
                        >
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                            ))}
                        </select>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
