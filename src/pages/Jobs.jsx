import React, { useEffect, useState } from 'react'
import StudentLayout from '../layouts/StudentLayout'
import { jobService } from '../services/jobService'
import { Loader2, Briefcase, Building2, Calendar, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

export default function Jobs() {
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all' | 'internship' | 'job'

    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            try {
                const data = await jobService.getListings(
                    filter === 'all' ? {} : { listing_type: filter }
                )
                setListings(data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [filter])

    return (
        <StudentLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Internships &amp; Jobs</h1>
                    <p className="text-slate-500 mt-1">Opportunities posted by the university on behalf of partner companies.</p>
                </div>

                <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit">
                    {['all', 'internship', 'job'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-ttu-blue text-white' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {f === 'all' ? 'All' : `${f}s`}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-ttu-blue" />
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                        <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500">No opportunities posted yet. Check back soon.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {listings.map(job => (
                            <div key={job.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{job.title}</h3>
                                        <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                                            <Building2 className="h-4 w-4" /> {job.company_name}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${job.listing_type === 'internship' ? 'bg-blue-50 text-ttu-blue' : 'bg-purple-50 text-purple-600'
                                        }`}>
                                        {job.listing_type}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{job.description}</p>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    {job.deadline ? (
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" /> Apply by {format(new Date(job.deadline), 'MMM d, yyyy')}
                                        </span>
                                    ) : <span />}

                                    {job.apply_info.startsWith('http') ? (
                                        <a
                                            href={job.apply_info}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-semibold text-ttu-blue flex items-center gap-1 hover:underline"
                                        >
                                            Apply <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    ) : (
                                        <span className="text-sm font-semibold text-slate-700">{job.apply_info}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </StudentLayout>
    )
}
