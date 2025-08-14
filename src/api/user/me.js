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

// 이미지 업로드
export function uploadProfileImage(file) {
    const form = new FormData()
    form.append('file', file)
    return http.post('/auth/me/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}

// 내 정보 삭제(회원탈퇴)
export function deleteMe() {
    return http.delete('/auth/me/delete')
}
