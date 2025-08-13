// src/api/http.js
import axios from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
})

http.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// 만료/인증실패(401) 공통 처리
http.interceptors.response.use(
    (resp) => resp,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem('jwtToken')
            window.location.href = '/login?reason=expired'
        }
        return Promise.reject(error)
    }
)

export default http
