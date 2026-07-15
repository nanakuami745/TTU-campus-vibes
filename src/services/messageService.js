import { supabase } from '../lib/supabase'

export const messageService = {
    // Send Message
    async sendMessage(receiverId, content) {
        const { data: { user } } = await supabase.auth.getUser()

        // Check for existing payload for debug
        console.log('Sending message to', receiverId, content)

        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: user.id,
                receiver_id: receiverId,
                content,
                is_read: false
            })
            .select(`*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)`) // Fix foreign key if needed
            .single()

        if (error) throw error
        return data
    },

    // Get Conversation with a specific user
    async getConversation(otherUserId) {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data
    },

    // Get Recent Chats (Unique users interacted with)
    // Since SQL distinct on complex queries is hard with Supabase JS client sometimes,
    // we might fetch latest messages involving user and process client side for MVP.
    async getRecentChats() {
        const { data: { user } } = await supabase.auth.getUser()

        // Fetch messages where I am sender or receiver
        const { data, error } = await supabase
            .from('messages')
            .select(`
        *,
        sender:profiles!sender_id(*),
        receiver:profiles!receiver_id(*)
      `)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(50) // Limit to last 50 messages to build the list

        if (error) throw error

        // Process to get unique conversations
        const conversations = new Map()

        data.forEach(msg => {
            const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender
            if (!conversations.has(otherUser.id)) {
                conversations.set(otherUser.id, {
                    user: otherUser,
                    lastMessage: msg
                })
            }
        })

        return Array.from(conversations.values())
    },

    // Mark Read
    async markRead(messageIds) {
        if (!messageIds.length) return

        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', messageIds)

        if (error) console.error('Error marking read:', error)
    }
}
