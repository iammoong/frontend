import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    timeout: 5000,
})

export function useAxios() {

    const post = (url, payload, config) => api.post(url, payload, config)
    const get = (url, config) => api.get(url, config)
    const put = (url, payload, config) => api.put(url, payload, config)
    const del = (url, config) => api.delete(url, config)

    const checkUserId = (userId) =>
        api.get('/auth/exists/userId', { params: { userId } })

    const checkNickname = (nickname) =>
        api.get('/auth/exists/nickname', { params: { nickname } })

    // 로그인 함수 정의
    const login = (userId, password) =>
        api.post('/auth/login', { userId, password })

    return {
        post, get, put, delete: del,
        checkUserId,
        checkNickname,
        login,
        instance: api,
    }
}

