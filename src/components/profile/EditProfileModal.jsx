import React, { useState } from 'react'
import { X, Camera, Loader2 } from 'lucide-react'
import { profileService } from '../../services/profileService'
import { isValidIndexNumber, normalizeIndexNumber } from '../../lib/validators'
import { supabase } from '../../lib/supabase'

export default function EditProfileModal({ isOpen, onClose, profile, onUpdate, initialMode = 'details' }) {
    if (!isOpen) return null

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        department: profile.department || '',
        level: profile.level || '',
        index_number: profile.index_number || ''
    })
    const [newPassword, setNewPassword] = useState('')

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.index_number.trim() && !isValidIndexNumber(formData.index_number)) {
            setError('Index Number must be in the format BC/HPM/202/23 or 0723000012.')
            return
        }

        if (newPassword && newPassword.length < 6) {
            setError('New password must be at least 6 characters.')
            return
        }

        setLoading(true)
        try {
            const updates = {
                ...formData,
                index_number: formData.index_number.trim() ? normalizeIndexNumber(formData.index_number) : null
            }
            const updatedProfile = await profileService.updateProfile(profile.id, updates)

            if (newPassword) {
                const { error: pwError } = await supabase.auth.updateUser({ password: newPassword })
                if (pwError) throw pwError
            }

            onUpdate(updatedProfile)
            onClose()
        } catch (error) {
            console.error('Error updating profile:', error)
            if (error.message?.includes('index_number') || error.code === '23505') {
                setError('This Index Number is already registered to another account.')
            } else {
                setError(error.message || 'Failed to update profile. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0]
        if (!file) return

        setLoading(true)
        try {
            let url
            if (type === 'avatar') {
                url = await profileService.uploadAvatar(profile.id, file)
                onUpdate({ ...profile, avatar_url: url })
            } else {
                url = await profileService.uploadCover(profile.id, file)
                onUpdate({ ...profile, cover_url: url })
            }
            onClose()
        } catch (error) {
            console.error('Error uploading file:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    {initialMode === 'details' ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ttu-blue/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ttu-blue/20 resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Index Number</label>
                                <input
                                    type="text"
                                    name="index_number"
                                    value={formData.index_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ttu-blue/20"
                                    placeholder="BC/HPM/202/23 or 0723000012"
                                />
                                {!profile.index_number && (
                                    <p className="text-xs text-amber-600 mt-1">Not set yet — required for attendance check-in.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password (optional)</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ttu-blue/20"
                                    placeholder="Leave blank to keep your current password"
                                />
                                <p className="text-xs text-slate-400 mt-1">If your account was created by an admin, set your own password here.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ttu-blue/20"
                                        placeholder="e.g. Computer Science"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ttu-blue/20"
                                    >
                                        <option value="">Select Level</option>
                                        <option value="100">100</option>
                                        <option value="200">200</option>
                                        <option value="300">300</option>
                                        <option value="400">400</option>
                                        <option value="HND 1">HND 1</option>
                                        <option value="HND 2">HND 2</option>
                                        <option value="HND 3">HND 3</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                {error && (
                                    <p className="text-sm text-red-600 mr-auto self-center">{error}</p>
                                )}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-ttu-blue hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Upload {initialMode === 'avatar' ? 'Profile Picture' : 'Cover Photo'}
                            </h3>
                            <p className="text-slate-500 text-sm mb-6">Choose a file to upload. Recommended size: {initialMode === 'avatar' ? '500x500px' : '1200x400px'}</p>

                            <label className="relative cursor-pointer bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center gap-3 transition-all group">
                                <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                    <Camera className="h-6 w-6 text-ttu-blue" />
                                </div>
                                <span className="text-sm font-medium text-slate-600">Click to upload image</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, initialMode)}
                                    disabled={loading}
                                />
                            </label>

                            {loading && (
                                <div className="mt-6 flex items-center justify-center gap-2 text-ttu-blue">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-sm font-medium">Uploading...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
