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
    fetchUnreadBySender,
    fetchMyRooms
} from '@/api/chat/chat.js'
import {useAlertStore} from '@/store/alert.js'
import {getMe, getUserById} from '@/api/user/me.js'

export const useChatStore = defineStore('chat', () => {
    const connected = ref(false)
    const client = ref(null)
    const hasUnread = ref(false)
    const unreadCount = ref(0)

    // const isOpen = ref(false)
    const isHomeOpen = ref(false)
    // 좌측 패널 사용자 목록
    const users = ref([])
    const currentRoom = ref(null)
    const messages = reactive({})
    // roomId -> unsubscribe fn
    const subscriptions = reactive({})
    const currentUser = ref(null)

    // 사용자별 미읽음
    const unreadByUser = reactive({})

    // 나의 채팅방 목록
    const rooms = ref([])
    const windows = reactive([])

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
                currentUser.value = me

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

        client.value.subscribe(`/topic/chat.room.${roomId}`, (frame) => {
            const m = JSON.parse(frame.body)
            const rid = Number(m.roomId ?? m.room_id ?? roomId)
            const sender = Number(m.senderId ?? m.sender_id)
            const my = Number(currentUser.value?.id ?? 0)
            const isMine = sender === my

            if (!messages[rid]) messages[rid] = []
            messages[rid].push(m)

            if (!isMine) {
                // 창/현재방이 활성 상태가 아닐 때만 배지/알림
                const activeWindow = windows.some(w => w.roomId === rid && w.open)
                const viewingCurrent = isHomeOpen.value && currentRoom.value?.id === rid
                if (!activeWindow && !viewingCurrent) {
                    unreadByUser[sender] = (unreadByUser[sender] || 0) + 1
                    hasUnread.value = true

                    const alert = useAlertStore()
                    const senderName = m.senderNickname || '알림'
                    // 표현은 원하시는 문구에 맞춰 조정 가능합니다
                    alert.show(`${senderName}님에게서 메시지가 도착했습니다`, 'success')
                }
            }

            // 모달이 닫혀있거나, 다른 방을 보고 있을 때 알림 & 뱃지
            const viewingCurrent = isHomeOpen.value && currentRoom.value?.id === roomId
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

    // function openModal() {
    //     isOpen.value = true
    //     connect()
    // }
    //
    // function closeModal() {
    //     isOpen.value = false
    // }

    function openHome()  { isHomeOpen.value = true }

    function closeHome() { isHomeOpen.value = false }

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
        //isOpen.value = false
        isHomeOpen.value = false
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

    // 방 단건 읽음 처리용(대화창 오픈 시)
    async function markRoomRead(roomId) {
        await markRead(roomId)
        await refreshUnread()
    }

    // 특정 사용자 미읽음 0으로 리셋(대화창 오픈 시)
    function resetUnreadForUser(userId) {
        unreadByUser[userId] = 0
    }

    // 나의 채팅방 목록
    async function refreshRooms() {
        try {
            const list = await fetchMyRooms({ limit: 100 }) // 백엔드 추가 API
            rooms.value = list
        } catch {
            // 서버 API 없으면, 클라이언트 추론(임시): 메시지/미읽음 기반
            rooms.value = Object.keys(messages).map(roomId => {
                const arr = messages[roomId] || []
                const last = arr.length ? arr[arr.length - 1] : null
                const otherId = last ? (last.senderId === (currentUser?.id ?? currentRoom?.meId) ? (currentRoom?.otherUserId) : last.senderId) : null
                const other = users.value.find(u => Number(u.id) === Number(otherId))
                return { id: Number(roomId), other, lastMessage: last, unread: other ? (unreadByUser[other.id] || 0) : 0 }
            })
        }
    }

    // 방 선로딩(열기 전)
    async function ensureRoomLoadedByUser(userId) {
        const room = await openDmRoom(userId)      // 서버가 방 재사용/생성
        if (!messages[room.id]) {
            const page = await fetchMessages(room.id, { page: 0, size: 50 })
            messages[room.id] = page.content.reverse()
        }
        subscribeRoom(room.id)
        await markRead(room.id)
        await refreshUnread()
        unreadByUser[userId] = 0
        return room
    }

    // **개별 창 열기**(중복창 방지 + 포커싱)
    async function openWindowWith(userId) {
        const room = await ensureRoomLoadedByUser(userId)
        const found = windows.find(w => w.roomId === room.id)
        if (found) {
            found.open = true
            // 가장 위로 올리기(배열 뒤로 이동)
            const idx = windows.indexOf(found)
            windows.splice(idx, 1); windows.push(found)
            return
        }
        windows.push({ roomId: room.id, otherUserId: room.otherUserId, open: true, createdAt: Date.now() })
    }

    function closeWindow(roomId) {
        const idx = windows.findIndex(w => w.roomId === roomId)
        if (idx >= 0) windows.splice(idx, 1)
    }

    // **방 지정 전송**
    function sendMessageTo(roomId, text) {
        //if (!client.value || !connected.value) return
        client.value.publish({
            destination: `/app/chat.send.${roomId}`,
            body: JSON.stringify({ content: text }),
            headers: { 'content-type': 'application/json;charset=UTF-8' }
        })
    }

    return {
        connected, hasUnread, unreadCount, isHomeOpen, users, currentRoom, messages, unreadByUser,
        sendMessage, refreshUnreadBySender, currentUser,

        rooms, windows, openHome, closeHome,
        connect, refreshUsers, refreshUnread, openRoomWith, subscribeRoom,
        refreshRooms, openWindowWith, closeWindow, sendMessageTo, markRoomRead, resetUnreadForUser,

        disconnect, reset
    }
})
