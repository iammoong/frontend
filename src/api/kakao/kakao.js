// src/api/kakao.js
import { kakaoApi } from '@/api/kakao/kakaoAuth.js'

export function kakaoLogin(code) {
    return kakaoApi.post('/api/auth/kakao/login', { code })
}
