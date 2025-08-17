import http from '@/api/token/http.js'

export const fetchUsers = ({q = '', limit = 50} = {}) =>
    http.get('/api/chat/users', {params: {q, limit}}).then(r => r.data)

export const openDmRoom = (userId) =>
    http.post('/api/chat/rooms/dm', null, {params: {userId}})
        .then(r => r.data)

export const fetchMessages = (roomId, {page = 0, size = 50} = {}) =>
    http.get(`/api/chat/rooms/${roomId}/messages`, {params: {page, size}})
        .then(r => r.data)

export const markRead = (roomId) =>
    http.post(`/api/chat/rooms/${roomId}/read`)

export const fetchUnreadCount = () =>
    http.get('/api/chat/unread/count').then(r => r.data)

 export const fetchUnreadBySender = () =>
     http.get('/api/chat/unread/by-sender').then(r => r.data)
// 나의 채팅방 목록
export const fetchMyRooms = ({limit = 50} = {}) =>
    http.get('/api/chat/rooms/my', {params: {limit}}).then(r => r.data)


