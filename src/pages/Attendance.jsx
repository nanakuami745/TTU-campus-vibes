import React, { useEffect, useState, useRef } from 'react'
import QRCode from 'qrcode'
import StudentLayout from '../layouts/StudentLayout'
import { classRepService } from '../services/classRepService'
import { attendanceService } from '../services/attendanceService'
import { Loader2, QrCode, Users, Clock, StopCircle, History, MapPin } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { format, formatDistanceToNow } from 'date-fns'

export default function Attendance() {
    const [repCourses, setRepCourses] = useState([])
    const [loadingRepCourses, setLoadingRepCourses] = useState(true)
    const [activeSession, setActiveSession] = useState(null)
    const [starting, setStarting] = useState(null)
    const [error, setError] = useState('')

    const [history, setHistory] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(true)

    useEffect(() => {
        classRepService.getMyRepCourses()
            .then(setRepCourses)
            .catch(console.error)
            .finally(() => setLoadingRepCourses(false))

        attendanceService.getMyCheckins()
            .then(setHistory)
            .catch(console.error)
            .finally(() => setLoadingHistory(false))
    }, [])

    const handleStart = async (courseId) => {
        setStarting(courseId)
        setError('')
        try {
            const session = await attendanceService.startSession(courseId)
            setActiveSession(session)
        } catch (e) {
            setError(e.message || 'Failed to start session')
        } finally {
            setStarting(null)
        }
    }

    return (
        <StudentLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
                    <p className="text-slate-500 mt-1">QR check-in for class sessions, verified by location.</p>
                </div>

                {/* Rep controls */}
                {!loadingRepCourses && repCourses.length > 0 && !activeSession && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <QrCode className="h-4 w-4" /> Start a Session
                        </h2>
                        <p className="text-sm text-slate-500">You're a class rep for these courses. Starting a session captures your current location as the class venue.</p>
                        <div className="space-y-2">
                            {repCourses.map(c => (
                                <div key={c.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900">{c.code}</p>
                                        <p className="text-xs text-slate-500">{c.name}</p>
                                    </div>
                                    <Button size="sm" onClick={() => handleStart(c.id)} disabled={starting === c.id}>
                                        {starting === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Session'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                )}

                {activeSession && (
                    <ActiveSessionPanel
                        session={activeSession}
                        onEnded={() => setActiveSession(null)}
                    />
                )}

                {/* Attendance history */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                    <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                        <History className="h-4 w-4" /> Your Attendance History
                    </h2>
                    {loadingHistory ? (
                        <Loader2 className="h-5 w-5 animate-spin text-ttu-blue" />
                    ) : history.length === 0 ? (
                        <p className="text-sm text-slate-500">No check-ins yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {history.map(h => (
                                <div key={h.id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{h.session?.course?.code} — {h.session?.course?.name}</p>
                                        <p className="text-xs text-slate-400">{format(new Date(h.checked_in_at), 'MMM d, yyyy · h:mm a')}</p>
                                    </div>
                                    <span className="text-xs text-green-600 font-semibold">Checked in</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    )
}

function ActiveSessionPanel({ session, onEnded }) {
    const [qrDataUrl, setQrDataUrl] = useState(null)
    const [checkins, setCheckins] = useState([])
    const [timeLeft, setTimeLeft] = useState('')
    const [ending, setEnding] = useState(false)
    const pollRef = useRef(null)

    useEffect(() => {
        const checkinUrl = `${window.location.origin}/attendance/checkin/${session.id}`
        QRCode.toDataURL(checkinUrl, { width: 260, margin: 1 }).then(setQrDataUrl)
    }, [session.id])

    useEffect(() => {
        const fetchCheckins = () => {
            attendanceService.getSessionCheckins(session.id).then(setCheckins).catch(console.error)
        }
        fetchCheckins()
        pollRef.current = setInterval(fetchCheckins, 5000)
        return () => clearInterval(pollRef.current)
    }, [session.id])

    useEffect(() => {
        const tick = () => {
            const diff = new Date(session.expires_at) - new Date()
            if (diff <= 0) {
                setTimeLeft('Expired')
                clearInterval(interval)
                return
            }
            const mins = Math.floor(diff / 60000)
            const secs = Math.floor((diff % 60000) / 1000)
            setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`)
        }
        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [session.expires_at])

    const handleEnd = async () => {
        setEnding(true)
        try {
            await attendanceService.endSession(session.id)
            clearInterval(pollRef.current)
            onEnded()
        } catch (e) {
            alert('Failed to end session')
        } finally {
            setEnding(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-slate-900">{session.course?.code} — Session Active</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" /> Location captured · {session.radius_meters}m radius
                    </p>
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4" /> {timeLeft}
                </span>
            </div>

            <div className="flex flex-col items-center py-4 bg-slate-50 rounded-xl">
                {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Attendance QR Code" className="rounded-lg shadow-sm" />
                ) : (
                    <Loader2 className="h-8 w-8 animate-spin text-ttu-blue" />
                )}
                <p className="text-xs text-slate-500 mt-3">Students scan this with their phone camera to check in.</p>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" /> Checked in ({checkins.length})
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-1">
                    {checkins.length === 0 ? (
                        <p className="text-sm text-slate-400">No check-ins yet.</p>
                    ) : checkins.map(c => (
                        <div key={c.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                            <div>
                                <span className="text-slate-700 font-medium">{c.student?.full_name}</span>
                                <span className="text-xs text-slate-500 ml-2 font-mono">
                                    {c.student?.index_number || 'No index number'}
                                </span>
                            </div>
                            <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(c.checked_in_at), { addSuffix: true })}</span>
                        </div>
                    ))}
                </div>
            </div>

            <Button variant="outline" onClick={handleEnd} disabled={ending} className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50">
                {ending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><StopCircle className="h-4 w-4" /> End Session</>}
            </Button>
        </div>
    )
}
