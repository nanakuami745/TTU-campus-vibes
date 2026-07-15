import React, { useEffect, useState } from 'react'
import StudentLayout from '../layouts/StudentLayout'
import { marketplaceService } from '../services/marketplaceService'
import { useAuth } from '../context/AuthContext'
import { Loader2, Plus, Search, Tag, X, Trash2, CheckCircle2, ShoppingBag } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { formatDistanceToNow } from 'date-fns'

const CATEGORY_LABELS = {
    textbooks: 'Textbooks',
    electronics: 'Electronics',
    housing: 'Housing / Sublets',
    clothing: 'Clothing & Gear',
    miscellaneous: 'Miscellaneous'
}

export default function Marketplace() {
    const { user } = useAuth()
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState('')
    const [listingType, setListingType] = useState('')
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)

    const fetchListings = async () => {
        setLoading(true)
        try {
            const data = await marketplaceService.getListings({ category, listing_type: listingType, search })
            setListings(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchListings() }, [category, listingType])

    const handleSearch = (e) => {
        e.preventDefault()
        fetchListings()
    }

    const handleMarkSold = async (id) => {
        try {
            await marketplaceService.updateStatus(id, 'sold')
            setListings(prev => prev.filter(l => l.id !== id))
        } catch (e) { alert('Failed to update listing') }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this listing?')) return
        try {
            await marketplaceService.deleteListing(id)
            setListings(prev => prev.filter(l => l.id !== id))
        } catch (e) { alert('Failed to delete listing') }
    }

    return (
        <StudentLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
                        <p className="text-slate-500 mt-1">Buy, sell, or request items — every seller is a verified TTU student.</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" /> New Listing
                    </Button>
                </div>

                <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search listings..."
                            className="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-ttu-blue/20"
                        />
                    </div>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="h-10 rounded-full border border-slate-200 px-4 text-sm bg-white">
                        <option value="">All categories</option>
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <select value={listingType} onChange={e => setListingType(e.target.value)} className="h-10 rounded-full border border-slate-200 px-4 text-sm bg-white">
                        <option value="">Sell &amp; Buy</option>
                        <option value="sell">For Sale</option>
                        <option value="buy">Wanted</option>
                    </select>
                </form>

                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-ttu-blue" /></div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 text-slate-500">
                        <ShoppingBag className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        No listings match right now.
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {listings.map(item => (
                            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                {item.image_url && (
                                    <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" />
                                )}
                                <div className="p-4 space-y-2 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-display font-bold text-slate-900">{item.title}</h3>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${item.listing_type === 'sell' ? 'bg-ttu-gold/15 text-amber-800' : 'bg-ttu-sky text-ttu-blue'}`}>
                                            {item.listing_type === 'sell' ? 'For Sale' : 'Wanted'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Tag className="h-3.5 w-3.5" /> {CATEGORY_LABELS[item.category]}
                                    </p>
                                    <p className="text-sm text-slate-600 flex-1">{item.description}</p>
                                    {item.price != null && (
                                        <p className="font-display font-bold text-ttu-blue text-lg">GH₵{Number(item.price).toFixed(2)}</p>
                                    )}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <span className="text-xs text-slate-400">
                                            {item.seller?.full_name} · {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                        </span>
                                        {item.seller_id === user?.id && (
                                            <div className="flex gap-1">
                                                <button onClick={() => handleMarkSold(item.id)} title="Mark sold" className="p-1.5 rounded-lg hover:bg-green-50 text-green-600">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-red-600">
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

            {showForm && <NewListingForm onClose={() => setShowForm(false)} onCreated={fetchListings} />}
        </StudentLayout>
    )
}

function NewListingForm({ onClose, onCreated }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('textbooks')
    const [listingType, setListingType] = useState('sell')
    const [price, setPrice] = useState('')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required.')
            return
        }
        setLoading(true)
        setError('')
        try {
            await marketplaceService.createListing({
                title, description, category, listing_type: listingType,
                price: listingType === 'sell' && price ? parseFloat(price) : null,
                file
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
            <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-display font-bold text-slate-900">New Listing</h2>
                    <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex gap-2">
                        {['sell', 'buy'].map(t => (
                            <button type="button" key={t} onClick={() => setListingType(t)}
                                className={`flex-1 py-2 rounded-full text-sm font-semibold ${listingType === t ? 'bg-ttu-blue text-white' : 'bg-slate-100 text-slate-600'}`}>
                                {t === 'sell' ? 'Selling' : 'Looking to buy'}
                            </button>
                        ))}
                    </div>
                    <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full min-h-[80px] p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm resize-none"
                    />
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-10 rounded-xl border border-slate-300 px-3 text-sm">
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    {listingType === 'sell' && (
                        <Input type="number" step="0.01" placeholder="Price (GH₵) — optional" value={price} onChange={e => setPrice(e.target.value)} />
                    )}
                    <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm" />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post Listing'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
