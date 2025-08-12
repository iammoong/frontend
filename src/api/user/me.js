import http from '@/api/token/http.js'

// 내 정보 조회
export function getMe() {
    return http.get('/auth/me')
}

// 내 정보 수정
export function updateMe(payload) {
    return http.put('/auth/me', payload)
}

// 비밀번호 변경
export function changePassword(payload) {
    return http.put('/auth/me/password', payload)
}
