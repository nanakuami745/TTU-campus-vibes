import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import { messageService } from '../services/messageService'
import { friendService } from '../services/friendService'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Send, Search, MoreVertical, Phone, Video } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function Messages() {
    const { user } = useAuth()
    const location = useLocation()
    const [conversations, setConversations] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef()

    // Load Recent Chats & Handle query param
    useEffect(() => {
        loadData()
    }, [user.id]) // Depend on user.id mainly

    const loadData = async () => {
        try {
            const recent = await messageService.getRecentChats()
            setConversations(recent)

            // Check URL param
            const searchParams = new URLSearchParams(location.search)
            const targetUserId = searchParams.get('userId')

            if (targetUserId) {
                // If we have a target, check if they are already in recent chats
                const existingChat = recent.find(c => c.user.id === targetUserId)

                if (existingChat) {
                    setSelectedUser(existingChat.user)
                } else {
                    // Fetch profile manually if not in recent chats
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', targetUserId).single()
                    if (profile) {
                        setSelectedUser(profile)
                    }
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Realtime subscription for list updates (new incoming message from new person)
    useEffect(() => {
        const subscription = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                if (payload.new.receiver_id === user.id || payload.new.sender_id === user.id) {
                    // Ideally verify if we need to reload or just update state, but for now reload list
                    // We don't want to re-trigger loadData which resets selection if we are chatting
                    // so maybe just separate fetch logic. For now kept simple.
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [user.id])

    // Load Chat History & Subscribe when User Selected
    useEffect(() => {
        if (!selectedUser) return

        const loadChat = async () => {
            const history = await messageService.getConversation(selectedUser.id)
            setMessages(history)
            scrollToBottom()
        }
        loadChat()

        // Realtime subscription for specific chat
        const chatSub = supabase
            .channel(`chat:${selectedUser.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${selectedUser.id}` // Listen for messages FROM them (sent to me)
            }, payload => {
                setMessages(prev => [...prev, payload.new])
                scrollToBottom()
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${user.id}` // Listen for messages FROM me (sent by me on other tab)
            }, payload => {
                // We might already optimistic add, but duplication check or state update is safe
                // Actually simpler to just listen to all involves
                // let's just listen to all messages involving this pair if possible or just rely on state for own messages
            })
            .subscribe()

        return () => {
            supabase.removeChannel(chatSub)
        }
    }, [selectedUser])

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedUser) return

        try {
            const sentMsg = await messageService.sendMessage(selectedUser.id, newMessage)
            setMessages(prev => [...prev, sentMsg])
            setNewMessage('')
            scrollToBottom()
            loadConversations() // Update sidebar with latest msg preview
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <StudentLayout>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex h-[calc(100vh-8rem)] overflow-hidden">

                {/* Sidebar - Chat List */}
                <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="font-bold text-xl text-slate-900 mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ttu-blue/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.length > 0 ? (
                            conversations.map(chat => (
                                <div
                                    key={chat.user.id}
                                    onClick={() => setSelectedUser(chat.user)}
                                    className={`p-4 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${selectedUser?.id === chat.user.id ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="relative">
                                        <img
                                            src={chat.user.avatar_url || `https://ui-avatars.com/api/?name=${chat.user.full_name}&background=random`}
                                            alt={chat.user.full_name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-semibold text-slate-900 truncate">{chat.user.full_name}</h4>
                                            <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(chat.lastMessage.created_at), { addSuffix: false })}</span>
                                        </div>
                                        <p className={`text-sm truncate ${!chat.lastMessage.is_read && chat.lastMessage.sender_id !== user.id ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                                            {chat.lastMessage.sender_id === user.id ? 'You: ' : ''}{chat.lastMessage.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No conversations yet. Start a chat from your Network!
                            </div>
                        )}
                    </div>
                </div>

                {/* Listen to 'Start Chat' logic: If user navigates with ?userId=xyz, we should default select them. 
            For now, user selects from sidebar or we can add a 'New Chat' button later.
         */}

                {/* Main Chat Area */}
                <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSelectedUser(null)} className="md:hidden text-slate-500">
                                        {/* Back arrow for mobile */}
                                        ←
                                    </button>
                                    <img
                                        src={selectedUser.avatar_url || `https://ui-avatars.com/api/?name=${selectedUser.full_name}&background=random`}
                                        alt={selectedUser.full_name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-bold text-slate-900">{selectedUser.full_name}</h3>
                                        <p className="text-xs text-green-500 flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                            Online
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <button className="p-2 hover:bg-slate-50 rounded-full"><Phone className="h-5 w-5" /></button>
                                    <button className="p-2 hover:bg-slate-50 rounded-full"><Video className="h-5 w-5" /></button>
                                    <button className="p-2 hover:bg-slate-50 rounded-full"><MoreVertical className="h-5 w-5" /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                                {messages.map((msg, index) => {
                                    const isMe = msg.sender_id === user.id
                                    return (
                                        <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe
                                                ? 'bg-ttu-blue text-white rounded-br-none'
                                                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <span className={`text-[10px] block text-right mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={scrollRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-slate-100">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-slate-50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ttu-blue/20"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-ttu-blue text-white p-2.5 rounded-full hover:bg-blue-900 disabled:opacity-50 transition-colors"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-ttu-blue mb-4">
                                <Send className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Your Messages</h3>
                            <p className="text-slate-500 max-w-sm mt-2">Select a conversation from the left to start chatting or connect with friends in your network.</p>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    )
}
