import React from 'react'
import { Camera, MapPin, Briefcase, Calendar, Edit, UserPlus, MessageCircle, MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'

export default function ProfileHeader({ profile, isOwnProfile, onEdit, friendCount, friendshipStatus, onSendRequest, onRespondRequest, activeTab, onTabChange }) {
    if (!profile) return null

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 transition-colors">
            {/* Cover Photo */}
            <div className="h-48 md:h-80 relative bg-slate-200 dark:bg-slate-700">
                {profile.cover_url ? (
                    <img
                        src={profile.cover_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-ttu-blue to-blue-600"></div>
                )}

                {isOwnProfile && (
                    <button
                        onClick={() => onEdit('cover')}
                        className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Camera className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit Cover</span>
                    </button>
                )}
            </div>

            {/* Profile Info Section */}
            <div className="px-4 pb-6 md:px-8">
                <div className="relative flex flex-col items-center md:items-start">
                    {/* Avatar */}
                    <div className="-mt-16 md:-mt-20 mb-4 relative group">
                        <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-700">
                            <img
                                src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=random`}
                                alt={profile.full_name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {isOwnProfile && (
                            <button
                                onClick={() => onEdit('avatar')}
                                className="absolute bottom-2 right-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 p-2 rounded-full shadow-sm text-slate-700 dark:text-slate-200 transition-colors"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Name & Actions */}
                    <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">{profile.full_name}</h1>
                            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium mt-1">
                                {profile.department ? `${profile.department}` : 'Student at TTU'}
                                {profile.level && ` • Level ${profile.level}`}
                            </p>

                            <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                                {friendCount !== undefined && (
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 hover:underline cursor-pointer">
                                        {friendCount} friends
                                    </span>
                                )}
                            </div>

                            {/* Bio */}
                            {profile.bio && (
                                <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-2xl mx-auto md:mx-0">
                                    {profile.bio}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 justify-center md:justify-end shrink-0 mb-2">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => onEdit('details')}
                                    className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    {friendshipStatus === 'friends' ? (
                                        <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 cursor-default">
                                            <UserPlus className="h-4 w-4" />
                                            Friends
                                        </button>
                                    ) : friendshipStatus === 'sent' ? (
                                        <button className="bg-blue-50 text-ttu-blue px-4 py-2 rounded-lg font-semibold flex items-center gap-2 cursor-default">
                                            Request Sent
                                        </button>
                                    ) : friendshipStatus === 'received' ? (
                                        <button
                                            onClick={() => onRespondRequest('accepted')}
                                            className="bg-ttu-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                                        >
                                            Confirm Request
                                        </button>
                                    ) : (
                                        <button
                                            onClick={onSendRequest}
                                            className="bg-ttu-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            Add Friend
                                        </button>
                                    )}

                                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors">
                                        <MessageCircle className="h-4 w-4" />
                                        Message
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-8 py-3 border-t border-slate-100 dark:border-slate-700 flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400 overflow-x-auto">
                {['posts', 'about', 'friends', 'photos'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`capitalize pb-3 -mb-3.5 border-b-2 transition-colors ${activeTab === tab
                            ? 'text-ttu-blue dark:text-blue-400 border-ttu-blue dark:border-blue-400 font-semibold'
                            : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div >
    )
}
