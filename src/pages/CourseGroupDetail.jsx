import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import CreatePost from '../components/feed/CreatePost'
import PostCard from '../components/feed/PostCard'
import { courseGroupService } from '../services/courseGroupService'
import { postService } from '../services/postService'
import { useAuth } from '../context/AuthContext'
import { Loader2, ArrowLeft, Users2, Pin, LogIn, LogOut, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function CourseGroupDetail() {
    const { groupId } = useParams()
    const { profile } = useAuth()
    const [group, setGroup] = useState(null)
    const [posts, setPosts] = useState([])
    const [isMember, setIsMember] = useState(false)
    const [loading, setLoading] = useState(true)
    const [joining, setJoining] = useState(false)
    const [editingPin, setEditingPin] = useState(false)
    const [pinText, setPinText] = useState('')

    const fetchPosts = async () => {
        try {
            const data = await postService.getCourseGroupPosts(groupId)
            setPosts(data)
        } catch (e) { console.error(e) }
    }

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [g, p, member] = await Promise.all([
                courseGroupService.getGroup(groupId),
                postService.getCourseGroupPosts(groupId),
                courseGroupService.isMember(groupId)
            ])
            setGroup(g)
            setPosts(p)
            setIsMember(member)
            setPinText(g.pinned_announcement || '')
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [groupId])

    const canManage = profile?.role === 'admin' || group?.created_by === profile?.id

    const handleJoinToggle = async () => {
        setJoining(true)
        try {
            if (isMember) {
                await courseGroupService.leaveGroup(groupId)
                setIsMember(false)
            } else {
                await courseGroupService.joinGroup(groupId)
                setIsMember(true)
            }
            fetchAll()
        } catch (e) {
            alert('Failed to update membership')
        } finally {
            setJoining(false)
        }
    }

    const savePin = async () => {
        try {
            const updated = await courseGroupService.updatePinnedAnnouncement(groupId, pinText || null)
            setGroup(updated)
            setEditingPin(false)
        } catch (e) {
            alert('Failed to update announcement')
        }
    }

    const handleDeleteGroup = async () => {
        if (!confirm('Delete this course group? All its discussion posts will also be removed.')) return
        try {
            await courseGroupService.deleteGroup(groupId)
            window.location.href = '/course-groups'
        } catch (e) {
            alert('Failed to delete group')
        }
    }

    if (loading) {
        return (
            <StudentLayout>
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-ttu-blue" /></div>
            </StudentLayout>
        )
    }

    return (
        <StudentLayout>
            <div className="space-y-4">
                <Link to="/course-groups" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ttu-blue">
                    <ArrowLeft className="h-4 w-4" /> All Course Groups
                </Link>

                <div className="bg-gradient-to-br from-ttu-blue to-blue-900 rounded-2xl p-5 text-white">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Users2 className="h-5 w-5 text-ttu-gold" />
                                <h1 className="text-xl font-display font-bold">{group?.name}</h1>
                            </div>
                            <p className="text-sm text-blue-100">{group?.course?.code} — {group?.course?.name}</p>
                            {group?.description && <p className="text-sm text-blue-100 mt-2">{group.description}</p>}
                            <p className="text-xs text-blue-200 mt-2">{group?.members?.[0]?.count || 0} members</p>
                        </div>
                        <Button onClick={handleJoinToggle} disabled={joining} variant={isMember ? 'secondary' : 'primary'} size="sm" className="shrink-0 gap-1">
                            {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : isMember ? <><LogOut className="h-4 w-4" /> Leave</> : <><LogIn className="h-4 w-4" /> Join</>}
                        </Button>
                    </div>

                    {canManage ? (
                        editingPin ? (
                            <div className="mt-3 flex gap-2">
                                <input
                                    value={pinText}
                                    onChange={e => setPinText(e.target.value)}
                                    className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-blue-200"
                                    placeholder="Pinned announcement..."
                                />
                                <button onClick={savePin} className="text-sm font-semibold text-ttu-gold">Save</button>
                            </div>
                        ) : (
                            <button onClick={() => setEditingPin(true)} className="mt-3 w-full text-left bg-white/10 rounded-2xl p-3 flex items-start gap-2 hover:bg-white/15 transition-colors">
                                <Pin className="h-4 w-4 text-ttu-gold mt-0.5 shrink-0" />
                                <p className="text-sm">{group?.pinned_announcement || 'Add a pinned announcement...'}</p>
                            </button>
                        )
                    ) : group?.pinned_announcement && (
                        <div className="mt-3 bg-white/10 rounded-2xl p-3 flex items-start gap-2">
                            <Pin className="h-4 w-4 text-ttu-gold mt-0.5 shrink-0" />
                            <p className="text-sm">{group.pinned_announcement}</p>
                        </div>
                    )}

                    {canManage && (
                        <button onClick={handleDeleteGroup} className="mt-3 flex items-center gap-1 text-xs text-red-300 hover:text-red-200">
                            <Trash2 className="h-3.5 w-3.5" /> Delete this group
                        </button>
                    )}
                </div>

                {isMember ? (
                    <>
                        <CreatePost onPostCreated={fetchPosts} courseGroupId={groupId} />
                        <div className="space-y-4">
                            {posts.length > 0 ? (
                                posts.map(post => <PostCard key={post.id} post={post} onDelete={(postId) => setPosts(prev => prev.filter(p => p.id !== postId))} />)
                            ) : (
                                <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                                    <p className="text-slate-500">No discussion here yet. Start it off!</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                        <p className="text-slate-500">Join this group to see and take part in the discussion.</p>
                    </div>
                )}
            </div>
        </StudentLayout>
    )
}
