import React, { useEffect, useState } from 'react'
import { courseService } from '../../services/courseService'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { BookOpen, Loader2, Trash2, Plus, X } from 'lucide-react'

export default function AdminCourses() {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    const fetchCourses = async () => {
        setLoading(true)
        try {
            const data = await courseService.getCourses()
            setCourses(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCourses() }, [])

    const handleDelete = async (course) => {
        if (!confirm(`Delete ${course.code}? This also removes any feedback, resources, and attendance history tied to it.`)) return
        try {
            await courseService.deleteCourse(course.id)
            setCourses(prev => prev.filter(c => c.id !== course.id))
        } catch (e) {
            alert('Failed to delete course')
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Powers Course Feedback, Academic Resources, and Attendance — add every course students should be able to select.
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Course
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Code</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Department</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Level</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Lecturer</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin text-ttu-blue mx-auto" /></td></tr>
                            ) : courses.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-slate-500">
                                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-slate-300" /> No courses added yet.
                                </td></tr>
                            ) : courses.map(course => (
                                <tr key={course.id}>
                                    <td className="px-6 py-4 font-medium text-slate-900">{course.code}</td>
                                    <td className="px-6 py-4 text-slate-600">{course.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{course.department || '—'}</td>
                                    <td className="px-6 py-4 text-slate-600">{course.level || '—'}</td>
                                    <td className="px-6 py-4 text-slate-600">{course.lecturer_name || '—'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(course)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
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
                <AddCourseForm onClose={() => setShowForm(false)} onCreated={fetchCourses} />
            )}
        </div>
    )
}

function AddCourseForm({ onClose, onCreated }) {
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [department, setDepartment] = useState('')
    const [level, setLevel] = useState('')
    const [lecturerName, setLecturerName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!code.trim() || !name.trim()) {
            setError('Course code and name are required.')
            return
        }
        setLoading(true)
        setError('')
        try {
            await courseService.createCourse({
                code: code.trim().toUpperCase(),
                name: name.trim(),
                department: department.trim() || null,
                level: level.trim() || null,
                lecturer_name: lecturerName.trim() || null
            })
            onCreated()
            onClose()
        } catch (err) {
            if (err.message?.includes('duplicate') || err.code === '23505') {
                setError('A course with this code already exists.')
            } else {
                setError(err.message || 'Failed to add course')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Add Course</h2>
                    <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Input placeholder="Course code (e.g. CS 301)" value={code} onChange={e => setCode(e.target.value)} />
                    <Input placeholder="Course name (e.g. Database Systems)" value={name} onChange={e => setName(e.target.value)} />
                    <Input placeholder="Department (optional)" value={department} onChange={e => setDepartment(e.target.value)} />
                    <Input placeholder="Level (e.g. 300) (optional)" value={level} onChange={e => setLevel(e.target.value)} />
                    <Input placeholder="Lecturer name (optional)" value={lecturerName} onChange={e => setLecturerName(e.target.value)} />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Course'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
