import {defineStore} from 'pinia'
import {ref, reactive} from 'vue'
import SockJS from 'sockjs-client'
import {Client as StompClient} from '@stomp/stompjs'
import {
    fetchUsers,
    openDmRoom,
    fetchMessages,
    markRead,
    fetchUnreadCount,
    fetchUnreadBySender
} from '@/api/chat/chat.js'
import {useAlertStore} from '@/store/alert.js'
import {getMe, getUserById} from '@/api/user/me.js'

export const useChatStore = defineStore('chat', () => {
    const connected = ref(false)
    const client = ref(null)
    const hasUnread = ref(false)
    const unreadCount = ref(0)

    const isOpen = ref(false)
    const users = ref([]) // 좌측 패널 사용자 목록
    const currentRoom = ref(null) // { id, meId, otherUserId }
    const messages = reactive({})  //
    const subscriptions = reactive({}) // roomId -> unsubscribe fn

    const unreadByUser = reactive({})   // 사용자별 미읽음

    function connect() {
        if (connected.value) return
        const token = localStorage.getItem('jwtToken')
        const wsUrl = import.meta.env.VITE_WS_URL

        const stomp = new StompClient({
            webSocketFactory: () => new SockJS(`${wsUrl}?token=${encodeURIComponent(token)}`),
            reconnectDelay: 3000,
            onConnect: async () => {
                connected.value = true

                // 미읽음 초기화
                await refreshUsers()
                //사용자별 미읽음 초기화
                await refreshUnread()
                await refreshUnreadBySender()

                const me = (await getMe()).data
                const sub = client.value.subscribe(`/topic/notify.${me.id}`, async frame => {
                    const evt = JSON.parse(frame.body) // {type, total, roomId, senderId, bySender}
                    unreadCount.value = evt.total
                    hasUnread.value = evt.total > 0
                    if (evt.senderId != null && evt.bySender != null) {
                        unreadByUser[evt.senderId] = evt.bySender
                    }
                    // 목록에 없는 새 DM 발신자는 실시간으로 추가
                    const exists = users.value.some(u => u.id === evt.senderId)
                    if (!exists) {
                        try {
                            const {data: u} = await getUserById(evt.senderId)
                            const item = {
                                id: u.id,
                                nickname: u.nickname,
                                username: u.username,
                                email: u.email,
                                profileImageId: u.profileImage ? u.profileImage.id : null
                            }
                            users.value = [item, ...users.value.filter(x => x.id !== item.id)]
                        } catch (e) {
                            // 단건 조회 실패 시 전체 갱신(안전망)
                            await refreshUsers()
                        }
                    }
                })
                subscriptions.notify = () => sub.unsubscribe()
            },
            onStompError: (f) => console.error('[STOMP ERROR]', f.headers['message'], f.body),
            debug: () => {
            } // 콘솔 스팸 방지
        })
        stomp.activate()
        client.value = stomp
    }

    async function refreshUsers({q = '', limit = 50} = {}) {
        users.value = await fetchUsers({q, limit})
    }

    async function refreshUnread() {
        const cnt = await fetchUnreadCount()
        unreadCount.value = cnt
        hasUnread.value = cnt > 0
    }

    async function refreshUnreadBySender() {
        const list = await fetchUnreadBySender() // [{userId, count}]
        Object.keys(unreadByUser).forEach(k => delete unreadByUser[k])
        list.forEach(({userId, count}) => unreadByUser[userId] = count)
    }

    async function openRoomWith(userId) {
        const room = await openDmRoom(userId)
        currentRoom.value = room
        if (!messages[room.id]) {
            const page = await fetchMessages(room.id, {page: 0, size: 50})
            messages[room.id] = page.content.reverse() // 과거→현재 순으로
        }
        subscribeRoom(room.id)
        await markRead(room.id)
        await refreshUnread()
        unreadByUser[room.otherUserId] = 0
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
                // hasUnread.value = true
                // unreadCount.value += 1
                const alert = useAlertStore()
                const sender = payload.senderNickname || '알수없음'
                alert.show(`${sender} 메시지가 도착했습니다.`, 'success')
            } else {
                // 현재 방을 보고 있으면 읽음 처리
                markRead(roomId).then(refreshUnread).catch(() => {
                })
            }
        })
        subscriptions[roomId] = () => sub.unsubscribe()
    }

    function sendMessage(text) {
        if (!currentRoom.value || !client.value || !connected.value) return
        client.value.publish({
            destination: `/app/chat.send.${currentRoom.value.id}`,
            body: JSON.stringify({content: text}),
            headers: {'content-type': 'application/json;charset=UTF-8'}
        })
    }

    function openModal() {
        isOpen.value = true
        connect()
    }

    function closeModal() {
        isOpen.value = false
    }

    function disconnect() {
        // 해지
        Object.values(subscriptions).forEach(unsub => {
            try {
                unsub && unsub()
            } catch {
            }
        })
        Object.keys(subscriptions).forEach(k => delete subscriptions[k])

        // STOMP 종료
        try {
            client.value?.deactivate?.()
        } catch {
        }
        client.value = null
        connected.value = false
    }

    function reset() {
        disconnect()
        // 메모리 상태 초기화
        hasUnread.value = false
        unreadCount.value = 0
        isOpen.value = false
        users.value = []
        currentRoom.value = null
        Object.keys(messages).forEach(k => delete messages[k])
    }

    // 토큰 삭제(다른 탭 포함) 감지 시 자동 초기화
    if (typeof window !== 'undefined') {
        window.addEventListener('storage', (e) => {
            if (e.key === 'jwtToken' && e.newValue == null) reset()
        })
    }


    return {
        // state
        connected, hasUnread, unreadCount, isOpen, users, currentRoom, messages, unreadByUser,
        // actions
        connect, refreshUsers, refreshUnread, openRoomWith, subscribeRoom,
        sendMessage, openModal, closeModal, refreshUnreadBySender,
        // 새로 추가
        disconnect, reset
    }
})
