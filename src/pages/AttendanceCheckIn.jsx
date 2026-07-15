import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import { useAuth } from '../context/AuthContext'
import { attendanceService } from '../services/attendanceService'
import { Loader2, CheckCircle2, XCircle, MapPin, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function AttendanceCheckIn() {
    const { sessionId } = useParams()
    const { profile } = useAuth()
    const [session, setSession] = useState(null)
    const [loadingSession, setLoadingSession] = useState(true)
    const [status, setStatus] = useState('idle') // idle | checking | success | error
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        attendanceService.getSession(sessionId)
            .then(setSession)
            .catch(() => setSession(null))
            .finally(() => setLoadingSession(false))
    }, [sessionId])

    const handleCheckIn = async () => {
        setStatus('checking')
        setErrorMsg('')
        try {
            await attendanceService.checkIn(sessionId)
            setStatus('success')
        } catch (e) {
            setErrorMsg(e.message || 'Check-in failed')
            setStatus('error')
        }
    }

    const isExpired = session && new Date(session.expires_at) < new Date()
    const isEnded = session?.ended_at

    return (
        <StudentLayout>
            <div className="max-w-md mx-auto mt-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center space-y-4">
                    {loadingSession ? (
                        <Loader2 className="h-8 w-8 animate-spin text-ttu-blue mx-auto" />
                    ) : !session ? (
                        <>
                            <XCircle className="h-10 w-10 text-red-400 mx-auto" />
                            <h2 className="font-bold text-slate-900">Session not found</h2>
                            <p className="text-sm text-slate-500">This attendance link is invalid.</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-xl font-bold text-slate-900">{session.course?.code}</h1>
                            <p className="text-sm text-slate-500">{session.course?.name}</p>

                            {(isExpired || isEnded) ? (
                                <div className="pt-2">
                                    <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">
                                        {isEnded ? 'This session has ended.' : 'This session has expired.'}
                                    </p>
                                </div>
                            ) : status === 'success' ? (
                                <div className="pt-2">
                                    <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-green-700">You're checked in!</p>
                                </div>
                            ) : !profile?.index_number ? (
                                <div className="pt-2 space-y-3">
                                    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                                    <p className="text-sm text-slate-600">
                                        You need to add your Index Number to your profile before you can check in.
                                    </p>
                                    <Link to="/profile">
                                        <Button className="w-full">Go to Profile</Button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" /> Your location will be checked against the class venue
                                    </p>
                                    {status === 'error' && (
                                        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>
                                    )}
                                    <Button onClick={handleCheckIn} disabled={status === 'checking'} className="w-full">
                                        {status === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check In'}
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>

                {status === 'success' && (
                    <div className="text-center mt-4">
                        <Link to="/attendance" className="text-sm text-ttu-blue font-semibold hover:underline">
                            View your attendance history
                        </Link>
                    </div>
                )}
            </div>
        </StudentLayout>
    )
}
