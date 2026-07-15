import React, { useEffect, useState } from 'react'
import { jobService } from '../../services/jobService'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Briefcase, Loader2, Trash2, Plus, X } from 'lucide-react'

export default function AdminJobs() {
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    const fetchListings = async () => {
        setLoading(true)
        try {
            const data = await jobService.getListings()
            setListings(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchListings() }, [])

    const handleDelete = async (id) => {
        if (!confirm('Delete this listing?')) return
        try {
            await jobService.deleteListing(id)
            setListings(prev => prev.filter(l => l.id !== id))
        } catch (e) {
            alert('Failed to delete listing')
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Internship &amp; Job Listings</h1>
                    <p className="text-sm text-slate-500 mt-1">Post opportunities on behalf of partner companies.</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> New Listing
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Title</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Company</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Type</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin text-ttu-blue mx-auto" /></td></tr>
                            ) : listings.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-10 text-slate-500">
                                    <Briefcase className="h-6 w-6 mx-auto mb-2 text-slate-300" /> No listings yet.
                                </td></tr>
                            ) : listings.map(job => (
                                <tr key={job.id}>
                                    <td className="px-6 py-4 font-medium text-slate-900">{job.title}</td>
                                    <td className="px-6 py-4 text-slate-600">{job.company_name}</td>
                                    <td className="px-6 py-4 text-slate-600 capitalize">{job.listing_type}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(job.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
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
                <NewListingForm
                    onClose={() => setShowForm(false)}
                    onCreated={fetchListings}
                />
            )}
        </div>
    )
}

function NewListingForm({ onClose, onCreated }) {
    const [title, setTitle] = useState('')
    const [company, setCompany] = useState('')
    const [type, setType] = useState('internship')
    const [description, setDescription] = useState('')
    const [applyInfo, setApplyInfo] = useState('')
    const [deadline, setDeadline] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim() || !company.trim() || !description.trim() || !applyInfo.trim()) {
            setError('Please fill in all required fields.')
            return
        }
        setLoading(true)
        setError('')
        try {
            await jobService.createListing({
                title,
                company_name: company,
                listing_type: type,
                description,
                apply_info: applyInfo,
                deadline
            })
            onCreated()
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to create listing')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">New Listing</h2>
                    <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex gap-2">
                        {['internship', 'job'].map(t => (
                            <button
                                type="button"
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize ${type === t ? 'bg-ttu-blue text-white' : 'bg-slate-100 text-slate-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <Input placeholder="Job title" value={title} onChange={e => setTitle(e.target.value)} />
                    <Input placeholder="Company name" value={company} onChange={e => setCompany(e.target.value)} />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full min-h-[100px] p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none"
                    />
                    <Input placeholder="Apply link, email, or instructions" value={applyInfo} onChange={e => setApplyInfo(e.target.value)} />
                    <div>
                        <label className="text-xs text-slate-500">Application deadline (optional)</label>
                        <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post Listing'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
