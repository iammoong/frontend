import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
})

export async function sendEmailCode(email) {
    return api.post('/auth/mail/sendCode', { email });
}

export async function findUserId(email) {
    return api.get('/auth/mail/findUserid', { params: { email } });
}
export async function checkCodeAndFindId(email, code) {
    return api.post('/auth/mail/checkCodeAndFindId', { email, code });
}

export async function kakaoLogin(code) {
    return api.post('/auth/kakao/login', { code });
}

// 비밀번호 찾기: userId로 연락처(이메일, 휴대폰) 마스킹 조회
export async function findUser(userId) {
    return api.get('/auth/mail/findUser', { params: { userId } });
}

// 비밀번호 찾기: 임시 비밀번호 발송 (type: 'email' 또는 'phone')
export async function sendTempPassword({ userId, type }) {
    return api.post('/auth/mail/sendTempPw', { userId, type });
}

export default api;
