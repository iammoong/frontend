import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000,
})

export async function sendEmailCode(email) {
    return api.post('/auth/mail/sendCode', { email });
}

export async function checkEmailCode(email, code) {
    return api.post('/auth/mail/checkCode', { email, code });
}

export async function findUserId(email) {
    return api.get('/auth/mail/findUserid', { params: { email } });
}
export async function checkCodeAndFindId(email, code) {
    return api.post('/auth/mail/checkCodeAndFindId', { email, code });
}

export default api;
