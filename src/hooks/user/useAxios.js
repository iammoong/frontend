import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000,
})

export function useAxios() {

    const post = (url, payload, config) => api.post(url, payload, config)
    const get = (url, config) => api.get(url, config)
    const put = (url, payload, config) => api.put(url, payload, config)
    const del = (url, config) => api.delete(url, config)

    const checkUserId = (userId) =>
        api.get('api/auth/exists/userId', { params: { userId } })

    const checkNickname = (nickname) =>
        api.get('api/auth/exists/nickname', { params: { nickname } })

    // 로그인 함수 정의
    const login = (userId, password) =>
        api.post('api/auth/login', { userId, password })

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    const getMe = () => api.get('api/auth/me')

    return {
        post, get, put, delete: del,
        checkUserId,
        checkNickname,
        login,
        getMe,
        instance: api,
    }
}

