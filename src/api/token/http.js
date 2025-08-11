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

export default http
