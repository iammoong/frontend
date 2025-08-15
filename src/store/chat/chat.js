import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import SockJS from 'sockjs-client'
import { Client as StompClient } from '@stomp/stompjs'
import { fetchUsers, openDmRoom, fetchMessages, markRead, fetchUnreadCount } from '@/api/chat/chat.js'
import { useAlertStore } from '@/store/alert.js'

export const useChatStore = defineStore('chat', () => {
    const connected = ref(false)
    const client = ref(null)
    const hasUnread = ref(false)
    const unreadCount = ref(0)

    const isOpen = ref(false)
    const users = ref([]) // 좌측 패널 사용자 목록
    const currentRoom = ref(null) // { id, meId, otherUserId }
    const messages = reactive({})  // roomId -> [{...}]
    const subscriptions = reactive({}) // roomId -> unsubscribe fn

    function connect() {
        if (connected.value) return
        const token = localStorage.getItem('jwtToken')
        const wsUrl = import.meta.env.VITE_WS_URL

        const stomp = new StompClient({
            webSocketFactory: () => new SockJS(`${wsUrl}?token=${encodeURIComponent(token)}`),
            reconnectDelay: 3000,
            onConnect: async () => {
                connected.value = true
                await refreshUsers()
                await refreshUnread()
            },
            onStompError: (f) => console.error('[STOMP ERROR]', f.headers['message'], f.body),
            debug: () => {} // 콘솔 스팸 방지
        })
        stomp.activate()
        client.value = stomp
    }

    async function refreshUsers({ q = '', limit = 50 } = {}) {
        users.value = await fetchUsers({ q, limit })
    }

    async function refreshUnread() {
        const cnt = await fetchUnreadCount()
        unreadCount.value = cnt
        hasUnread.value = cnt > 0
    }

    async function openRoomWith(userId) {
        const room = await openDmRoom(userId)
        currentRoom.value = room
        if (!messages[room.id]) {
            const page = await fetchMessages(room.id, { page: 0, size: 50 })
            messages[room.id] = page.content.reverse() // 과거→현재 순으로
        }
        subscribeRoom(room.id)
        await markRead(room.id)
        await refreshUnread()
    }

    function subscribeRoom(roomId) {
        if (!client.value || !connected.value) return
        if (subscriptions[roomId]) return

        const sub = client.value.subscribe(`/topic/chat.${roomId}`, (frame) => {
            const payload = JSON.parse(frame.body)
            if (!messages[roomId]) messages[roomId] = []
            messages[roomId].push(payload)

            // 모달이 닫혀있거나, 다른 방을 보고 있을 때 알림 & 뱃지
            const viewingCurrent = isOpen.value && currentRoom.value?.id === roomId
            if (!viewingCurrent) {
                hasUnread.value = true
                unreadCount.value += 1
                const alert = useAlertStore()
                const sender = payload.senderNickname || '알수없음'
                alert.show(`${sender} 메시지가 도착했습니다.`, 'success')
            } else {
                // 현재 방을 보고 있으면 읽음 처리
                markRead(roomId).then(refreshUnread).catch(()=>{})
            }
        })
        subscriptions[roomId] = () => sub.unsubscribe()
    }

    function sendMessage(text) {
        if (!currentRoom.value || !client.value || !connected.value) return
        client.value.publish({
            destination: `/app/chat.send.${currentRoom.value.id}`,
            body: JSON.stringify({ content: text }),
            headers: { 'content-type': 'application/json;charset=UTF-8' }
        })
    }

    function openModal() {
        isOpen.value = true
        connect()
    }

    function closeModal() {
        isOpen.value = false
    }

    return {
        // state
        connected, hasUnread, unreadCount,
        isOpen, users, currentRoom, messages,
        // actions
        connect, refreshUsers, refreshUnread, openRoomWith, subscribeRoom,
        sendMessage, openModal, closeModal
    }
})
