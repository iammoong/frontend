import axios from 'axios'

export const kakaoApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
})

kakaoApi.interceptors.request.use(cfg => {
    const token = localStorage.getItem('jwtToken')
    if (token) cfg.headers.Authorization = `Bearer ${token}`
    return cfg
})

export default kakaoApi;