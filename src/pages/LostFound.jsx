import React, { useEffect, useState } from 'react'
import StudentLayout from '../layouts/StudentLayout'
import { lostFoundService } from '../services/lostFoundService'
import { useAuth } from '../context/AuthContext'
import { Loader2, Plus, MapPin, Phone, CheckCircle2, Trash2, X, Search } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { formatDistanceToNow } from 'date-fns'

export default function LostFound() {
    const { user, profile } = useAuth()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('lost') // 'lost' | 'found'
    const [showForm, setShowForm] = useState(false)

    const fetchItems = async () => {
        setLoading(true)
        try {
            const data = await lostFoundService.getItems({ type: tab, status: 'open' })
            setItems(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchItems() }, [tab])

    const handleResolve = async (id) => {
        try {
            await lostFoundService.markResolved(id)
            setItems(prev => prev.filter(i => i.id !== id))
        } catch (e) {
            console.error(e)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this report?')) return
        try {
            await lostFoundService.deleteItem(id)
            setItems(prev => prev.filter(i => i.id !== id))
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <StudentLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Lost &amp; Found</h1>
                        <p className="text-slate-500 mt-1">Report or search for lost items on campus.</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Report Item
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit">
                    {['lost', 'found'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-ttu-blue text-white' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {t} items
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-ttu-blue" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                        <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500">No {tab} items reported right now.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {items.map(item => (
                            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {item.image_url && (
                                    <img src={item.image_url} alt={item.item_name} className="w-full h-40 object-cover" />
                                )}
                                <div className="p-4 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-bold text-slate-900">{item.item_name}</h3>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.item_type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                            {item.item_type}
                                        </span>
                                    </div>
                                    {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
                                    {item.location && (
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" /> {item.location}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" /> {item.contact_info}
                                    </p>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <span className="text-xs text-slate-400">
                                            {item.reporter?.full_name} · {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                        </span>
                                        {(item.reporter_id === user?.id || profile?.role === 'admin') && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleResolve(item.id)}
                                                    title="Mark resolved"
                                                    className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    title="Delete"
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showForm && <ReportForm onClose={() => setShowForm(false)} onCreated={fetchItems} />}
        </StudentLayout>
    )
}

function ReportForm({ onClose, onCreated }) {
    const [itemType, setItemType] = useState('lost')
    const [itemName, setItemName] = useState('')
    const [description, setDescription] = useState('')
    const [location, setLocation] = useState('')
    const [contact, setContact] = useState('')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!itemName.trim() || !contact.trim()) {
            setError('Item name and contact info are required.')
            return
        }
        setLoading(true)
        setError('')
        try {
            await lostFoundService.reportItem({
                item_type: itemType,
                item_name: itemName,
                description,
                location,
                contact_info: contact,
                file
            })
            onCreated()
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to submit report')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Report an Item</h2>
                    <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex gap-2">
                        {['lost', 'found'].map(t => (
                            <button
                                type="button"
                                key={t}
                                onClick={() => setItemType(t)}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize ${itemType === t ? 'bg-ttu-blue text-white' : 'bg-slate-100 text-slate-600'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <Input placeholder="Item name (e.g. Blue backpack)" value={itemName} onChange={e => setItemName(e.target.value)} />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full min-h-[80px] p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none"
                    />
                    <Input placeholder="Location (e.g. Library, 2nd floor)" value={location} onChange={e => setLocation(e.target.value)} />
                    <Input placeholder="Contact info (phone/email)" value={contact} onChange={e => setContact(e.target.value)} />
                    <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm" />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Report'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
