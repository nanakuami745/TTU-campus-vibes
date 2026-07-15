import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import ProfileHeader from '../components/profile/ProfileHeader'
import EditProfileModal from '../components/profile/EditProfileModal'
import ProfilePosts from '../components/profile/ProfilePosts'
import ProfileAbout from '../components/profile/ProfileAbout'
import ProfileFriends from '../components/profile/ProfileFriends'
import ProfilePhotos from '../components/profile/ProfilePhotos'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services/profileService'
import { friendService } from '../services/friendService'
import { Loader2 } from 'lucide-react'

export default function Profile() {
    const { userId } = useParams()
    const { user: currentUser } = useAuth()
    // navigate is unused but good to have if needed, removing if unused to avoid linter warnings
    // const navigate = useNavigate()

    // If no userId in URL, redirect to current user
    const targetUserId = userId || currentUser?.id
    const isOwnProfile = currentUser?.id === targetUserId

    const [profile, setProfile] = useState(null)
    const [friendCount, setFriendCount] = useState(0)
    const [friendshipStatus, setFriendshipStatus] = useState('none')
    const [loading, setLoading] = useState(true)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editMode, setEditMode] = useState('details') // 'details', 'avatar', 'cover'

    // New Tab State
    const [activeTab, setActiveTab] = useState('posts')

    useEffect(() => {
        if (!targetUserId) return

        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch Profile
                const profileData = await profileService.getProfile(targetUserId)
                setProfile(profileData)

                // Fetch Friend Count
                const count = await profileService.getFriendCount(targetUserId)
                setFriendCount(count)

                // Fetch Friendship Status (if not own profile)
                if (!isOwnProfile) {
                    const status = await friendService.getFriendshipStatus(targetUserId)
                    setFriendshipStatus(status)
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [targetUserId, isOwnProfile])

    const handleEditOpen = (mode) => {
        setEditMode(mode)
        setIsEditModalOpen(true)
    }

    const handleProfileUpdate = (updatedProfile) => {
        setProfile(updatedProfile)
    }

    const handleSendRequest = async () => {
        try {
            await friendService.sendRequest(targetUserId)
            setFriendshipStatus('sent')
        } catch (error) {
            console.error('Error sending request:', error)
        }
    }

    const handleRespondRequest = async (action) => {
        // Placeholder for respond logic if we implemented full friend management here
        console.log('Respond:', action)
    }

    if (loading) {
        return (
            <StudentLayout>
                <div className="flex justify-center pt-20">
                    <Loader2 className="h-8 w-8 animate-spin text-ttu-blue" />
                </div>
            </StudentLayout>
        )
    }

    if (!profile) {
        return (
            <StudentLayout>
                <div className="text-center pt-20 text-slate-500">Profile not found</div>
            </StudentLayout>
        )
    }

    return (
        <StudentLayout>
            <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                onEdit={handleEditOpen}
                friendCount={friendCount}
                friendshipStatus={friendshipStatus}
                onSendRequest={handleSendRequest}
                onRespondRequest={handleRespondRequest}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Profile Content */}
            <div className="max-w-4xl mx-auto pb-10">
                {activeTab === 'posts' && <ProfilePosts userId={targetUserId} />}
                {activeTab === 'about' && <ProfileAbout profile={profile} />}
                {activeTab === 'friends' && <ProfileFriends userId={targetUserId} />}
                {activeTab === 'photos' && <ProfilePhotos userId={targetUserId} />}
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                profile={profile}
                onUpdate={handleProfileUpdate}
                initialMode={editMode}
            />
        </StudentLayout>
    )
}
